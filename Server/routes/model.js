const router = require('express').Router();
const modelSystem = require('../services/modelSystem.js');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

// AR LOAD 버튼 클릭 시 모델링 완료됐는지 판단 후 응답
// 모델링 완료 됐으면 로딩에 필요한 파일들 인코딩해서 전달
// 완료되지 않았다면 false 값 전달
router.post('/vrload', (req, res) => {
    const postData = req.body;

    modelSystem.getModelFiles(postData)
        .then((modelFiles) => {
            modelFiles.success = true;
            res.status(200).json(modelFiles);
        })
        .catch(error => {
            res.status(500).json({success: false, error: error});
        })
});

module.exports = router;