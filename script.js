const video = document.getElementById('video')


Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/weights'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/weights'),
    faceapi.nets.faceExpressionNet.loadFromUri('/weights')
]).then(startVideo)


function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true }).then(
        stream => {
            console.log(stream)
            video.srcObject = stream;
        }).catch(
            err => console.error(err)
        )
}
