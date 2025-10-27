import { useState, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { qrAPI, classesAPI } from '../services/api';
import { useAlert } from '../hooks/useAlert';

const QRCheckin = () => {
  const [scanning, setScanning] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [lastCheckin, setLastCheckin] = useState(null);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    fetchClasses();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getAll();
      setClasses(response.data.filter(c => c.isActive));
    } catch (error) {
      showError('Error al cargar clases');
    }
  };

  const startScanning = async () => {
    if (!selectedClass) {
      showError('Selecciona una clase primero');
      return;
    }

    try {
      setScanning(true);
      
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }

      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await scannerRef.current.start();
    } catch (error) {
      showError('Error al iniciar cámara');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    setScanning(false);
  };

  const handleScanResult = async (qrData) => {
    try {
      stopScanning();
      
      const response = await qrAPI.processCheckin({
        qrData,
        classId: selectedClass
      });

      setLastCheckin(response.data);
      showSuccess(`✅ Check-in exitoso: ${response.data.member.firstName} ${response.data.member.lastName}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Error en check-in';
      showError(message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">QR Check-in</h1>

      {/* Selección de Clase */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Seleccionar Clase</h2>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar clase...</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name} - {cls.dayOfWeek} {cls.startTime}
            </option>
          ))}
        </select>
      </div>

      {/* Scanner */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Escáner QR</h2>
        
        <div className="flex flex-col items-center space-y-4">
          <video
            ref={videoRef}
            className={`w-full max-w-md rounded-lg ${scanning ? 'block' : 'hidden'}`}
            style={{ aspectRatio: '1/1' }}
          />
          
          {!scanning && (
            <div className="w-full max-w-md h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Cámara desactivada</p>
            </div>
          )}

          <div className="flex space-x-4">
            {!scanning ? (
              <button
                onClick={startScanning}
                disabled={!selectedClass}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                📷 Iniciar Escáner
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                ⏹️ Detener Escáner
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Último Check-in */}
      {lastCheckin && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Último Check-in</h3>
          <p className="text-green-700">
            <strong>{lastCheckin.member.firstName} {lastCheckin.member.lastName}</strong>
            {lastCheckin.member.belt && ` - ${lastCheckin.member.belt}`}
          </p>
          <p className="text-sm text-green-600 mt-1">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default QRCheckin;