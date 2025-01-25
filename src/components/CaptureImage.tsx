import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCapturedImage } from '../redux/CameraSlice';
import Webcam from 'react-webcam';
import { Grid, Box, Typography, Button, Card, CardContent, TextField } from '@mui/material';
import DisplayCapturedImage from './DisplayCapturedImage';

const CaptureImage: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const dispatch = useDispatch();

  const captureImage = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      dispatch(setCapturedImage({
        capturedImage: imageSrc,
        label: inputValue
      }));
      console.log('Image captured and saved to Redux store.');
    } else {
      console.error('Failed to capture image.');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    setButtonEnabled(newValue.trim() !== '');
  };

  return (
    <Box className="d-flex flex-column h-100 d-flex justify-content-center">
      <Grid container className="flex-grow-1" spacing={2}>
        <Grid item xs={12} md={6}>
          <Card className="border border-2 rounded-2 shadow-sm h-100">
            <CardContent>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Capture Image
              </Typography>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                    facingMode: 'user'
                }}
                style={{
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  width: '100%',
                  height: '100%',
                  marginBottom: '1rem',
                }}
              />
              
              <TextField
                fullWidth
                label="Enter label for captured image"
                variant="outlined"
                value={inputValue}
                onChange={handleInputChange}
                className="mt-2 mb-2 px-5 py-2 font-weight-bold text-transform-none shadow-sm rounded-4"
              />


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
        <Grid item xs={12} md={6}>
          <DisplayCapturedImage />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CaptureImage;
