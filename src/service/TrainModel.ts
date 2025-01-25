import * as faceapi from 'face-api.js';
import { CaptureState } from '../redux/CameraSlice';

export const loadLabeledImages = async (): Promise<faceapi.LabeledFaceDescriptors[]> => {
    // List of labels (names)
    const labels: string[] = [
      'Black Widow',
      'Captain America',
      'Hawkeye',
      'Jim Rhodes',
      'Tony Stark',
      'Thor',
      'Captain Marvel'
    ];
  
    return Promise.all(
        labels.map(async (label) => {
            const descriptions: Float32Array[] = [];
            for (let i = 1; i <= 2; i++) {
            const imgUrl = `../labeled_images/${label}/${i}.jpg`;
            try {
                const img = await faceapi.fetchImage(imgUrl);
                const detections = await faceapi
                .detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor();
    
                if (!detections || !detections.descriptor) {
                console.warn(`No face detected for ${label} in image ${i}`);
                continue;
                }
    
                console.log(label + ' ' + i + ' ' + JSON.stringify(detections));
                descriptions.push(detections.descriptor);
            } catch (error) {
                console.error(`Failed to load image for ${label} ${i}:` , error);
            }
            }

            console.log(`${label} Faces Loaded`);
    
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    );
};

export const loadImages = async (capturedImages: CaptureState[]): Promise<(faceapi.LabeledFaceDescriptors| null)[]> => {
    await loadModels()
    return Promise.all(
        capturedImages.map(async (image) => {
            const descriptions: Float32Array[] = [];
            try {
            const img = await faceapi.fetchImage(image.capturedImage)
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    
            if (!detections || !detections.descriptor) {
                console.warn(`No face detected for ${image.label}`);
                return null;
            }
    
            console.log(`${image.label} Face Loaded`);
            descriptions.push(detections.descriptor);
            } catch (error) {
            console.error(`Failed to load image for ${image.label}:`, error);
            }
    
            return new faceapi.LabeledFaceDescriptors(image.label, descriptions);
        })
    );
};

export const loadModels = async () => {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.ageGenderNet.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.load('/models');
    console.log('Models Loaded');
};