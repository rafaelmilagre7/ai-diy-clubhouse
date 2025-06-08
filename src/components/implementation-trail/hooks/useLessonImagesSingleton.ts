
import { useLessonImages } from './useLessonImages';

// Singleton pattern para o hook useLessonImages
// Isso garante que apenas uma instância do hook seja usada globalmente
let globalLessonImagesHook: ReturnType<typeof useLessonImages> | null = null;

export const useLessonImagesSingleton = () => {
  if (!globalLessonImagesHook) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    globalLessonImagesHook = useLessonImages();
  }
  return globalLessonImagesHook;
};
