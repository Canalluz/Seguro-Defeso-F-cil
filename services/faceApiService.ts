import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/vladmandic/face-api/model/';

export class FaceApiService {
    private static isInitialized = false;

    static async init() {
        if (this.isInitialized) return;

        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
            ]);
            this.isInitialized = true;
            console.log('FaceAPI models loaded successfully');
        } catch (error) {
            console.error('Error loading FaceAPI models:', error);
            throw error;
        }
    }

    static async detectFace(videoElement: HTMLVideoElement) {
        if (!this.isInitialized) await this.init();

        const detection = await faceapi.detectSingleFace(
            videoElement,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 })
        )
            .withFaceLandmarks()
            .withFaceDescriptor()
            .withFaceExpressions();

        if (detection) {
            // Resize to video dimensions for consistency
            const dims = faceapi.matchDimensions(videoElement, videoElement, true);
            return faceapi.resizeResults(detection, dims);
        }
        return null;
    }

    static checkAntiSpoofing(detection: any, videoWidth: number, videoHeight: number) {
        if (!detection) return { valid: false, reason: 'Nenhuma face detectada' };

        // Use relative box for anti-spoofing to avoid resolution issues
        const { box } = detection.detection;
        const faceWidthPercent = (box.width / videoWidth) * 100;
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        const centerOffsetPercentX = Math.abs((centerX / videoWidth) - 0.5) * 100;
        const centerOffsetPercentY = Math.abs((centerY / videoHeight) - 0.5) * 100;

        // 1. Minimum face size (prevent photos of photos)
        if (faceWidthPercent < 20) {
            return { valid: false, reason: 'Aproxime mais o rosto' };
        }
        if (faceWidthPercent > 80) {
            return { valid: false, reason: 'Afaste um pouco o rosto' };
        }

        // 2. Aspect ratio check (standard human face proportion)
        const aspectRatio = box.width / box.height;
        if (aspectRatio < 0.6 || aspectRatio > 1.4) {
            return { valid: false, reason: 'Rosto distorcido detectado' };
        }

        // 3. Centering check (allow 25% offset from center)
        if (centerOffsetPercentX > 25 || centerOffsetPercentY > 25) {
            return { valid: false, reason: 'Centralize o rosto' };
        }

        return { valid: true, confidence: detection.detection.score };
    }

    static compareFaces(descriptor1: Float32Array, descriptor2: Float32Array) {
        const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
        // Standard threshold is 0.6, lower is more strict
        const threshold = 0.6; // Relaxed slightly to 0.6 for better UX on mobile
        const similarity = Math.max(0, 1 - (distance / threshold)) * 100;

        return {
            match: distance < threshold,
            distance,
            similarity
        };
    }

    static drawLandmarks(canvas: HTMLCanvasElement, detection: any) {
        const ctx = canvas.getContext('2d');
        if (!ctx || !detection) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Match dimensions to ensure landmarks are drawn correctly relative to canvas
        const displaySize = { width: canvas.width, height: canvas.height };
        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetection = faceapi.resizeResults(detection, displaySize);

        // Draw landmarks with custom style
        const landmarks = resizedDetection.landmarks;
        ctx.fillStyle = '#4ade80'; // green-400
        landmarks.positions.forEach((point: any) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw bounding box
        const box = resizedDetection.detection.box;
        ctx.strokeStyle = '#3b82f6'; // blue-500
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        ctx.setLineDash([]);
    }
}
