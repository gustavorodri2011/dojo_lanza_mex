const QRCode = require('qrcode');
const { Member, Attendance, Class, BeltLevel } = require('../models');
const { decrypt } = require('../utils/encryption');

const generateMemberQR = async (req, res) => {
  try {
    const { id } = req.params;
    
    const member = await Member.findByPk(id, {
      include: [{
        model: BeltLevel,
        as: 'belt'
      }]
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const qrData = {
      type: 'member_checkin',
      memberId: member.id,
      timestamp: Date.now()
    };

    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));
    
    res.json({
      qrCode: qrCodeDataURL,
      member: {
        id: member.id,
        firstName: decrypt(member.firstName),
        lastName: decrypt(member.lastName),
        belt: member.belt?.name
      }
    });
  } catch (error) {
    console.error('Error generating QR:', error);
    res.status(500).json({ message: 'Error generating QR code' });
  }
};

const processQRCheckin = async (req, res) => {
  try {
    const { qrData, classId } = req.body;
    
    const parsedData = JSON.parse(qrData);
    
    if (parsedData.type !== 'member_checkin') {
      return res.status(400).json({ message: 'Invalid QR code type' });
    }

    const member = await Member.findByPk(parsedData.memberId, {
      include: [{
        model: BeltLevel,
        as: 'belt'
      }]
    });

    if (!member || !member.isActive) {
      return res.status(400).json({ message: 'Member not found or inactive' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    const existingAttendance = await Attendance.findOne({
      where: {
        memberId: member.id,
        classId: classId,
        attendanceDate: today
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    await Attendance.create({
      memberId: member.id,
      classId: classId,
      attendanceDate: today,
      status: 'presente'
    });

    res.json({
      success: true,
      message: 'Check-in successful',
      member: {
        firstName: decrypt(member.firstName),
        lastName: decrypt(member.lastName),
        belt: member.belt?.name
      }
    });
  } catch (error) {
    console.error('Error processing QR check-in:', error);
    res.status(500).json({ message: 'Error processing check-in' });
  }
};

module.exports = {
  generateMemberQR,
  processQRCheckin
};