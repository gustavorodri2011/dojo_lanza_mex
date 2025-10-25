const { Class, Attendance, Member, BeltLevel } = require('../models');
const { decrypt } = require('../utils/encryption');

/**
 * Obtiene todas las clases
 */
const getClasses = async (req, res) => {
  try {
    const { dayOfWeek, active } = req.query;
    const whereClause = {};
    
    if (dayOfWeek) whereClause.dayOfWeek = dayOfWeek;
    if (active !== undefined) whereClause.isActive = active === 'true';

    const classes = await Class.findAll({
      where: whereClause,
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
    });

    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Error fetching classes' });
  }
};

/**
 * Crea una nueva clase
 */
const createClass = async (req, res) => {
  try {
    const classData = req.body;
    const newClass = await Class.create(classData);
    res.status(201).json(newClass);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ message: 'Error creating class' });
  }
};

/**
 * Actualiza una clase
 */
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    await Class.update(updateData, { where: { id } });
    const updatedClass = await Class.findByPk(id);
    
    res.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ message: 'Error updating class' });
  }
};

/**
 * Elimina una clase
 */
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    await Class.destroy({ where: { id } });
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Error deleting class' });
  }
};

/**
 * Registra asistencia para una clase
 */
const recordAttendance = async (req, res) => {
  try {
    const { classId, attendanceDate, attendances } = req.body;
    
    // Eliminar asistencias existentes para esa fecha y clase
    await Attendance.destroy({
      where: { classId, attendanceDate }
    });

    // Crear nuevas asistencias
    const attendanceRecords = attendances.map(att => ({
      classId,
      memberId: att.memberId,
      attendanceDate,
      status: att.status,
      notes: att.notes
    }));

    await Attendance.bulkCreate(attendanceRecords);
    res.json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ message: 'Error recording attendance' });
  }
};

/**
 * Obtiene asistencia de una clase en una fecha específica
 */
const getAttendance = async (req, res) => {
  try {
    const { classId, date } = req.query;
    
    const attendances = await Attendance.findAll({
      where: { classId, attendanceDate: date },
      include: [{
        model: Member,
        as: 'member',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        include: [{
          model: BeltLevel,
          as: 'belt'
        }]
      }]
    });

    // Desencriptar datos
    const decryptedAttendances = attendances.map(att => ({
      id: att.id,
      memberId: att.memberId,
      status: att.status,
      notes: att.notes,
      member: {
        id: att.member.id,
        firstName: decrypt(att.member.firstName),
        lastName: decrypt(att.member.lastName),
        email: att.member.email
      }
    }));

    res.json(decryptedAttendances);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance' });
  }
};

module.exports = {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  recordAttendance,
  getAttendance
};