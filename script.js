const expressionsCheckbox = document.getElementById('expressions')
const landmarksCheckbox = document.getElementById('landmarks')
const detectionsCheckbox = document.getElementById('detections')
const retainCheckbox = document.getElementById('retain')
const btn = document.getElementById('btn')
const video = document.getElementById('video')

let started = false

let retain = false
let drawLandmarks = true
let drawDetections = true
let drawExpressions = false

expressionsCheckbox.checked = drawExpressions;
expressionsCheckbox.addEventListener('change', function () {
    drawExpressions = this.checked
});

landmarksCheckbox.checked = drawLandmarks;
landmarksCheckbox.addEventListener('change', function () {
    drawLandmarks = this.checked
});

detectionsCheckbox.checked = drawDetections;
detectionsCheckbox.addEventListener('change', function () {
    drawDetections = this.checked
});

retainCheckbox.checked = retain;
retainCheckbox.addEventListener('change', function () {
    retain = this.checked
});

btn.disabled = true
btn.addEventListener('click', () => {
    if (started) {
        started = false
        btn.textContent = "Start"
        video.style.opacity = "1";
    } else {
        started = true
        btn.textContent = "Stop"
        video.style.opacity = "0";
    }
})

// Main video loop
video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)

    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)

    btn.textContent = "Loading..."

    setInterval(async () => {

        // perform detections
        let detections = []
        if (drawExpressions) {
            detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        } else {
            detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
        }

        updateButton(detections.length > 0)
        if (!started) {
            return
        }
        if (detections.length < 1) {
            return
        }

        // conditionally clean canvas
        if (!retain) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        }

        // adjust to video size
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        // draw the stuff
        drawDetections && faceapi.draw.drawDetections(canvas, resizedDetections)
        drawLandmarks && faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        try {
            drawExpressions && faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        } catch (e) {
        }

    }, 30)
})

// to enable Start button when face detection is ready
function updateButton(ready) {
    if (ready && !started) {
        btn.textContent = "Start"
        btn.disabled = false;
    }
}

// to hook up webcam stream
function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true }).then(
        stream => {
            video.srcObject = stream;
        }).catch(
            err => {
                window.alert("Please enable the camera")
                location.reload();
            }
        )
}

// Load the models and start video
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./weights'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./weights'),
    faceapi.nets.faceExpressionNet.loadFromUri('./weights')
]).then(startVideo)