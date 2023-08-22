const router = require('express').Router();
const loginSystem = require('../services/loginSystem.js');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

// TODO: 유효한 값인지 확인 필요, 안드로이드에서 어떤 잘못된 값을 보낼 수 있는지 아직 몰라서 보류
// 보안이 중요하다고 여기는 경우 POST 요청 사용이 바람직

// 아이디 중복검사 라우터
router.post('/idcheck', async (req, res) => {
    const userData = req.body;
    console.log(userData);

    try {
        const user = await loginSystem.findUserById(userData);

        if (user.length === 0) { // 아이디가 존재하지 않는 경우
            res.status(200).json({success: true, message: 'Valid ID'});
        } else { // 아이디가 존재할 경우
            res.status(200).json({success: false, message: 'Exist User'});
        }
    } catch (error) {
        res.status(500).json({success: false, message: 'Error'});
    }
});

// 로그인 라우터 
router.post('/userLogin', async (req, res) => {
    const userData = req.body;
    const result = await loginSystem.login(userData);

    if (result) {
        res.status(200).json({success: true, message: 'Login Success'});
    } else {
        res.status(401).json({success: false, message: 'Login Fail'});
    }
});

// 회원가입 라우터
router.post('/registUser', async (req, res) => {
    const userData = req.body;
    console.log(userData);

    try {
        const result = await loginSystem.registUser(userData);

        if (result) {
            res.status(201).json({success: true, message: 'Regist Success'});
        } else {
            res.status(400).json({success: false, message: 'Regist Fail'});
        }
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});

module.exports = router;