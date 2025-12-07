const { User, Student } = require('../models');

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [User],
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [User],
    });
    if (!student) {
      return res.status(404).json({ error: 'Студент не найден' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;
    
    const user = await User.create({
      email,
      password,
      full_name,
      phone,
      role: 'student',
    });

    const student = await Student.create({
      user_id: user.id,
    });

    res.status(201).json({ user, student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Студент не найден' });
    }

    await student.update(req.body);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Студент не найден' });
    }

    await User.destroy({ where: { id: student.user_id } });
    await student.destroy();
    res.json({ message: 'Студент удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
