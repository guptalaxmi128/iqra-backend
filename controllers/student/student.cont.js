const db = require('../../models');
const Student = db.student;
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { studentSecret } = require('../../configs/auth.config');

//register a student
exports.registerStudent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(402).json({errors: errors.array() });
    }
    try{
        const { name, email, password, contactNumber, optSubject, noOfCopies, batch, cunfirmPassword } = req.body;
        const isStudent = await Student.findOne({where: {email: email}});
        if (isStudent) {
            return res.status(400).send('Sorry! This email id exists.');
        }
        if(cunfirmPassword != password) {
            return res.status(400).send('Sorry! Password should be match.');
        }
        const salt = await bcrypt.genSalt(10);
        const bcPassword = await bcrypt.hash(password, salt);

        const students = await Student.create({
            name: name,
            email: email,
            password: bcPassword,
            optSubject: optSubject,
            noOfCopies: noOfCopies,
            batch: batch,
            contactNumber: contactNumber
        });

        const data = {
            studentId:{
                id: students.id
            }
        }
        const authToken = jwt.sign(data, studentSecret);
        res.status(201).json({authToken});
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

//Login a student
exports.loginStudent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(402).json({errors: errors.array() });
    }
    try{
        const { email, password} = req.body;
        const isStudent = await Student.findOne({where: {email: email}});
        if (!isStudent) {
            return res.status(400).send('Sorry! try to login with currect credentials.');
        }

        const compairPassword = await bcrypt.compare(password, isStudent.password);
        if (!compairPassword) {
            return res.status(400).send('Sorry! try to login with currect credentials.');
        }

        const data = {
            studentId:{
                id: isStudent.id
            }
        }
        //console.log(data);
        const authToken = jwt.sign(data, studentSecret);
        res.status(201).json({authToken});
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};