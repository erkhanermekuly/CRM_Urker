const { User, Teacher } = require('../models');

exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      include: [User],
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [User],
    });
    if (!teacher) {
      return res.status(404).json({ error: 'Преподаватель не найден' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const { email, password, full_name, phone, specialization, qualifications } = req.body;
    
    const user = await User.create({
      email,
      password,
      full_name,
      phone,
      role: 'teacher',
    });

    const teacher = await Teacher.create({
      user_id: user.id,
      specialization,
      qualifications,
    });

    res.status(201).json({ user, teacher });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Преподаватель не найден' });
    }

    await teacher.update(req.body);
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Преподаватель не найден' });
    }

    await User.destroy({ where: { id: teacher.user_id } });
    await teacher.destroy();
    res.json({ message: 'Преподаватель удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
