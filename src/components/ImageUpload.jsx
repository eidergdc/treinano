import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiX } from 'react-icons/fi';
import imageCompression from 'browser-image-compression';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ImageUpload = ({ onImageSelect, currentImage, maxSizeMB = 1, onVideoSelect }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(currentImage || '');
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.');
      }

      // Compress image
      const options = {
        maxSizeMB,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: file.type
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);

      // Upload to Firebase Storage
      const fileExt = file.name.split('.').pop();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const storage = getStorage();
      const fileName = `images/${user.uid}/${crypto.randomUUID()}.${fileExt}`;
      const storageRef = ref(storage, fileName);

      // Upload file to Firebase Storage
      await uploadBytes(storageRef, compressedFile, {
        contentType: file.type
      });

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      onImageSelect(downloadURL);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error(error.message || 'Erro ao processar imagem');
      setPreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setPreview('');
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Função para converter URL do YouTube
  const convertYouTubeUrl = (url) => {
    try {
      // Padrões de URL do YouTube
      const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/
      ];

      // Tentar cada padrão
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          // Retornar URL de incorporação
          return `https://www.youtube.com/embed/${match[1]}`;
        }
      }

      // Se não corresponder a nenhum padrão, retornar a URL original
      return url;
    } catch (error) {
      console.error('Erro ao converter URL do YouTube:', error);
      return url;
    }
  };

  // Função para lidar com a entrada de URL do vídeo
  const handleVideoUrlChange = (e) => {
    const url = e.target.value;
    if (url) {
      const embedUrl = convertYouTubeUrl(url);
      if (onVideoSelect) {
        onVideoSelect(embedUrl);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearImage}
              className="absolute top-2 right-2 p-2 bg-dark-lighter rounded-full shadow-md"
            >
              <FiX className="text-primary" size={16} />
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-48 border-2 border-dashed border-dark-medium rounded-lg flex flex-col items-center justify-center bg-dark-light hover:bg-dark-medium transition-colors"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            ) : (
              <>
                <FiUpload size={32} className="text-primary mb-2" />
                <p className="text-light-darker">Clique para fazer upload</p>
                <p className="text-sm text-light-darker">ou arraste uma imagem</p>
              </>
            )}
          </motion.button>
        )}
      </div>

      {onVideoSelect && (
        <div>
          <label className="block text-sm font-medium text-light-darker mb-1">
            URL do Vídeo (YouTube)
          </label>
          <input
            type="url"
            onChange={handleVideoUrlChange}
            className="input-field"
            placeholder="Cole o link do YouTube aqui"
          />
          <p className="text-xs text-light-darker mt-1">
            Aceita links no formato: youtube.com/watch?v=ID, youtu.be/ID ou youtube.com/embed/ID
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;