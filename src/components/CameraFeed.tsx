import { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import { loadLabeledImages, loadModels } from '../service/TrainModel';
import { setLabeledDescriptors } from '../redux/FaceRecognitionSlice';
import { RootState } from '../redux/Store';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, CardContent, Grid, IconButton, Tooltip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import FaceIcon from '@mui/icons-material/Face';
import { toggleDetect, toggleVideo } from '../redux/VideoAndDetectSlice';
import { wait } from '@testing-library/user-event/dist/utils';
import LoadingOverlay from '../util/LoadingOverlay';

const CameraFeed = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blackCanvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const storeRoot = useSelector((state: RootState) => state.FaceRecognition);
  const videoDetectRoot = useSelector((state: RootState) => state.VideoAndDetect);
  const dispatch = useDispatch();
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [windowSize, setWindowSize] = useState<{width:number, height:number}>({
    width: 0,
    height: 0,
  });
  const [refreshKey, setRefreshKey] = useState<number>(1);

  let enableDetect: boolean = true;
  const [loading, setLoading] = useState<boolean>(false);

  const handleResize = () => {
    setWindowSize({
      width: 0.82*window.innerWidth,
      height: 0.82*window.innerHeight,
    });
    window.location.reload();
  }

  const toggleEnableDetect = () => {
    enableDetect = !enableDetect;
  }

  const calculateAspectRatio = () => {
    if(boxRef.current){
      const newAspectRatio = boxRef.current.clientWidth/boxRef.current.clientHeight;
      if(newAspectRatio !== Infinity && aspectRatio !== newAspectRatio){
        setAspectRatio(newAspectRatio)
      }
    }
  }
  
  const delay = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const startFaceDetection = () => {
    const videoElement = webcamRef.current?.video!;
    const canvas = canvasRef.current!;
    
    if (!videoElement || videoElement.clientWidth === 0 || videoElement.clientHeight === 0) return;
  
    const displaySize = { width: videoElement.clientWidth, height: videoElement.clientHeight };
    faceapi.matchDimensions(canvas, displaySize);
    const faceMatcher = new faceapi.FaceMatcher(storeRoot.labeledDescriptors, 0.7);
  
    const detectFaces = () => {
      try{
        if (videoDetectRoot.isVideoEnabled && videoDetectRoot.detect && enableDetect) {
          faceapi.detectAllFaces(videoElement)
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
              if (context && canvas && document.getElementById('canvas')) {
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
              delay(200).then(() => {})
              return resizedDetections;
            })
            .catch((err) => {
              console.error("Error during face detection:", err);
            });
        }
        else if(videoDetectRoot.isVideoEnabled && !enableDetect){
          setRefreshKey((prev) => prev+=1)
          return;
        }
        else{
          return;
        }
      }
      catch(err){
        console.error("Error during face detection:", err);
      }
      wait(200).then(() => {})
      requestAnimationFrame(detectFaces);
    };
    detectFaces();
  };

  useEffect(() => {
    setLoading(true);
    if (canvasRef.current && canvasRef.current.width === 0) {
      canvasRef.current.width = 640;
      canvasRef.current.height = 480;
    }

    setWindowSize({
      width: 0.82*window.innerWidth,
      height: 0.82*window.innerHeight,
    });
    
    loadModels().then(() => {
      loadLabeledImages().then((res) => {
        dispatch(setLabeledDescriptors(res));
        setLoading(false);
      })
    });

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if(blackCanvasRef.current){
      const blackCanvas = blackCanvasRef.current;
      const context = blackCanvas?.getContext('2d');
      if(context){
        context.fillStyle = 'black';
        context.fillRect(0, 0, blackCanvas.width, blackCanvas.height);
      }
    }
    if (storeRoot.labeledDescriptors.length > 0 && videoDetectRoot.isVideoEnabled && videoDetectRoot.detect) {
      startFaceDetection();
    }
  }, [storeRoot.labeledDescriptors, videoDetectRoot.isVideoEnabled]);

  useEffect(() => {
    if(videoDetectRoot.detect){
      startFaceDetection();
    }
  },[videoDetectRoot.detect])

  useEffect(() => {
    calculateAspectRatio()
  },[boxRef.current])

  return (
  <Box className="d-flex flex-column h-100 d-flex justify-content-center">
    <LoadingOverlay isOpen={loading} />
    <Grid container className="flex-grow-1 justify-content-center" spacing={2}>
      <Grid item xs={12} md={12}>
        <Card className="border border-2 rounded-2 shadow-sm h-100">
          <CardContent sx={{justifyItems: 'center'}}>
            <Box sx={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'clip'}}>
              <Box ref={boxRef} sx={{width: '100%', height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', overflow: 'clip'}}>
                {videoDetectRoot.isVideoEnabled  ? <><Webcam
                  ref={webcamRef}
                  audio={false}
                  height={windowSize.height}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: 'user',
                    aspectRatio: aspectRatio
                  }}
                  />
                  <div className='video'>
                    <canvas key={refreshKey} ref={canvasRef} id='canvas'/>
                  </div></> : (
                    <canvas ref= {blackCanvasRef} style={{ width: '100%', height: windowSize.height}} />
                  )}
              </Box>
              <Box sx={{width: '100%', height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                <Tooltip title="Toggle Video">
                  <IconButton className='video' size='large' disabled={videoDetectRoot.detect} color={videoDetectRoot.isVideoEnabled ? 'success' : 'error'} aria-label="VideoToggle" onClick={() => {dispatch(toggleVideo());}}>
                    {videoDetectRoot.isVideoEnabled ? <VideocamIcon fontSize="large" /> : <VideocamOffIcon fontSize="large"/>}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Toggle face detection">
                  <IconButton className='video' size='large'disabled={!videoDetectRoot.isVideoEnabled && enableDetect} color={videoDetectRoot.detect ? 'success' : 'error'} aria-label="VideoToggle" onClick={() => {dispatch(toggleDetect());toggleEnableDetect();}}>
                    <FaceIcon  fontSize="large"/>
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
  );
};

export default CameraFeed;