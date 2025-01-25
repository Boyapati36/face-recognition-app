import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import CameraFeed from './components/CameraFeed';
import CaptureImage from './components/CaptureImage';
import Header from './util/Header';
import ImageDetection from './components/ImageDetection';
import '@fontsource/lato'; 

function App() {
  return (
    <Router>
      <Header title="FaceApp"/>
      <Routes>
        <Route path="/" element={<CameraFeed />} />
        <Route path="/train-model" element={<CaptureImage/>} />
        <Route path="/image-detect" element={<ImageDetection/>} />
      </Routes>
    </Router>
  );
}

export default App;