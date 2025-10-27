const { Graduation, Member, BeltLevel } = require('../models');
const { decrypt } = require('../utils/encryption');

const getGraduations = async (req, res) => {
  try {
    const { memberId, belt, result } = req.query;
    const whereClause = {};
    
    if (memberId) whereClause.memberId = memberId;
    if (belt) whereClause.toBelt = belt;
    if (result) whereClause.result = result;

    const graduations = await Graduation.findAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: BeltLevel,
          as: 'fromBelt',
          attributes: ['id', 'name', 'color']
        },
        {
          model: BeltLevel,
          as: 'toBelt',
          attributes: ['id', 'name', 'color']
        }
      ],
      order: [['examDate', 'DESC']]
    });

    const decryptedGraduations = graduations.map(grad => ({
      ...grad.toJSON(),
      member: {
        id: grad.member.id,
        firstName: decrypt(grad.member.firstName),
        lastName: decrypt(grad.member.lastName),
        email: grad.member.email
      }
    }));

    res.json(decryptedGraduations);
  } catch (error) {
    console.error('Error fetching graduations:', error);
    res.status(500).json({ message: 'Error fetching graduations' });
  }
};

const createGraduation = async (req, res) => {
  try {
    const graduationData = req.body;
    
    // Generar número de certificado único
    const timestamp = Date.now();
    graduationData.certificateNumber = `CERT-${timestamp}`;
    
    const graduation = await Graduation.create(graduationData);
    
    // Si es aprobado, actualizar el cinturón del miembro
    if (graduation.result === 'aprobado') {
      await Member.update(
        { beltId: graduation.toBeltId },
        { where: { id: graduation.memberId } }
      );
    }
    
    const graduationWithMember = await Graduation.findByPk(graduation.id, {
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: BeltLevel,
          as: 'fromBelt',
          attributes: ['id', 'name', 'color']
        },
        {
          model: BeltLevel,
          as: 'toBelt',
          attributes: ['id', 'name', 'color']
        }
      ]
    });

    res.status(201).json({
      ...graduationWithMember.toJSON(),
      member: {
        id: graduationWithMember.member.id,
        firstName: decrypt(graduationWithMember.member.firstName),
        lastName: decrypt(graduationWithMember.member.lastName),
        email: graduationWithMember.member.email
      }
    });
  } catch (error) {
    console.error('Error creating graduation:', error);
    res.status(500).json({ message: 'Error creating graduation' });
  }
};

const updateGraduation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const graduation = await Graduation.findByPk(id);
    if (!graduation) {
      return res.status(404).json({ message: 'Graduation not found' });
    }
    
    await Graduation.update(updateData, { where: { id } });
    
    // Si cambió a aprobado, actualizar cinturón del miembro
    if (updateData.result === 'aprobado' && graduation.result !== 'aprobado') {
      await Member.update(
        { beltId: graduation.toBeltId },
        { where: { id: graduation.memberId } }
      );
    }
    
    const updatedGraduation = await Graduation.findByPk(id, {
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: BeltLevel,
          as: 'fromBelt',
          attributes: ['id', 'name', 'color']
        },
        {
          model: BeltLevel,
          as: 'toBelt',
          attributes: ['id', 'name', 'color']
        }
      ]
    });
    
    res.json({
      ...updatedGraduation.toJSON(),
      member: {
        id: updatedGraduation.member.id,
        firstName: decrypt(updatedGraduation.member.firstName),
        lastName: decrypt(updatedGraduation.member.lastName),
        email: updatedGraduation.member.email
      }
    });
  } catch (error) {
    console.error('Error updating graduation:', error);
    res.status(500).json({ message: 'Error updating graduation' });
  }
};

const deleteGraduation = async (req, res) => {
  try {
    const { id } = req.params;
    await Graduation.destroy({ where: { id } });
    res.json({ message: 'Graduation deleted successfully' });
  } catch (error) {
    console.error('Error deleting graduation:', error);
    res.status(500).json({ message: 'Error deleting graduation' });
  }
};

module.exports = {
  getGraduations,
  createGraduation,
  updateGraduation,
  deleteGraduation
};