import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Grid, Box, Button, Card, CardContent, IconButton, Tooltip } from '@mui/material';
import DisplayCapturedImage from './DisplayCapturedImage';
import { Delete } from '@mui/icons-material';
import * as faceapi from 'face-api.js';
import { RootState } from '../redux/Store';
import { useDispatch, useSelector } from 'react-redux';
import { loadLabeledImages, loadModels } from '../service/TrainModel';
import { setLabeledDescriptors } from '../redux/FaceRecognitionSlice';
import LoadingOverlay from '../util/LoadingOverlay';
import PermMediaIcon from '@mui/icons-material/PermMedia';

const ImageDetection: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useDispatch();
  const storeRoot = useSelector((state: RootState) => state.FaceRecognition);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [windowSize, setWindowSize] = useState<{width:number, height:number}>({
    width: 0,
    height: 0,
  });

  const captureImage = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setImgSrc(imageSrc ?? '');
    setButtonEnabled(false);
  };

  const calculateAspectRatio = () => {
    if(boxRef.current){
      const newAspectRatio = boxRef.current.clientWidth/boxRef.current.clientHeight;
      if(newAspectRatio !== Infinity && aspectRatio !== newAspectRatio){
        setAspectRatio(newAspectRatio)
      }
    }
  }

  const handleResize = () => {
    setWindowSize({
      width: 0.82*window.innerWidth,
      height: 0.82*window.innerHeight,
    });
    window.location.reload();
  }

  const startFaceDetection = async () => {
    const canvas = canvasRef.current!;
    const img = await faceapi.fetchImage(imgSrc);
    
    const displaySize = { width: imgRef.current!.width, height: imgRef.current!.height };
    faceapi.matchDimensions(canvas, displaySize);
    const faceMatcher = new faceapi.FaceMatcher(storeRoot.labeledDescriptors, 0.7);

    faceapi.detectAllFaces(img)
    .withFaceLandmarks()
    .withFaceDescriptors()
    .withAgeAndGender()
    .withFaceExpressions()
    .then((detections) => {
        if(detections.length === 0){
            return detections;
        }
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        resizedDetections.forEach((result) => {
            const { age, gender, expressions } = result;
            const genderText = `Gender: ${gender}`;
            const ageText = `Age (guess): ${Math.round(age)} years`;
            const expression = expressions.asSortedArray().reduce((max, current) =>
                current.probability > max.probability ? current : max
            );
            const expressionText = `Expression: ${expression.expression} - probabilty: ${expression.probability}`
            const name = faceMatcher.findBestMatch(result.descriptor).label;
            const box = result.detection.box;

            if (box.width > 0 && box.height > 0) {
                const drawBox = new faceapi.draw.DrawBox(box, { label: name });
                drawBox.draw(canvas);
            
                const textField = new faceapi.draw.DrawTextField(
                [genderText, ageText, expressionText],
                result.detection.box.bottomLeft
                );
                textField.draw(canvas);
            }
        });
        return resizedDetections;
    })
    .catch((err) => {
        console.error("Error during face detection:", err);
    });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImgSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
      calculateAspectRatio();
  },[boxRef.current])

  useEffect(() =>{
    if(imgSrc){
        startFaceDetection()
    }
  },[imgSrc])

  useEffect(() => {
    setLoading(true);
    setWindowSize({
      width: 0.81*window.innerWidth,
      height: 0.81*window.innerHeight,
    });

    loadModels().then(() => {
        loadLabeledImages().then((res) => {
            dispatch(setLabeledDescriptors(res));
            setLoading(false);
        })
    });
        
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  },[])

  return (
    <Box ref={boxRef} className="d-flex flex-column h-100 d-flex justify-content-center">
        <LoadingOverlay isOpen={loading}/>
        <Grid container className="flex-grow-1" spacing={2}>
            <Grid item xs={12} md={12} lg={12}>
            <Card className="border border-2 rounded-2 shadow-sm h-100">
                <CardContent sx={{display: 'flex', flexDirection:'column', alignItems: 'center'}}>
                    <Box sx={{display: 'flex', flexDirection:{ xs: 'column', md: 'row' }, alignItems: 'center'}}>
                        {!imgSrc && <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            videoConstraints = {{
                                facingMode: 'user',
                                aspectRatio: aspectRatio
                            }}
                            height={windowSize.height}
                            style={{
                            border: '2px solid #e0e0e0',
                            borderRadius: '10px',
                            marginBottom: '1rem',
                            }}
                            onUserMedia={() => setButtonEnabled(true)}
                        />}
                        {imgSrc &&  
                            <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', alignItems: 'center'}}>
                                <>
                                    <img ref = {imgRef}
                                        src={imgSrc}
                                        alt="Latest Captured Image"
                                    />
                                    <div className='video'>
                                        <canvas ref={canvasRef} id='canvas'/>
                                    </div>
                                </>
                                <IconButton size="small" color="error" aria-label="delete" onClick={() => {setImgSrc('');setButtonEnabled(true)}}>
                                    <Delete />
                                </IconButton>
                            </Box>
                        }

                        <label htmlFor='file'>
                            <input
                                id='file'
                                type='file'
                                accept="image/*"
                                hidden
                                onChange={handleImageChange}
                            />
                            <Tooltip title='Upload Image'>
                                <IconButton component='span'>
                                    <PermMediaIcon  fontSize="large"/>
                                </IconButton>
                            </Tooltip>
                        </label>
                    </Box>
                    
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={captureImage}
                        size="large"
                        disabled={!buttonEnabled}
                        className="mt-2 mb-2 px-5 py-2 font-weight-bold text-transform-none shadow-sm rounded-4"
                    >
                        Capture Image
                    </Button>
                </CardContent>
            </Card>
            </Grid>
            {!ImageDetection && <Grid item xs={12} md={6}>
            <DisplayCapturedImage />
            </Grid>}
        </Grid>
    </Box>
  );
};

export default ImageDetection;
