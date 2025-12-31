import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImagePreloadService {
  private readonly loadedImages = new Set<string>();

  preloadImages(urls: string[]): void {
    urls.forEach(url => {
      if (this.loadedImages.has(url)) {
        return;
      }

      const img = new Image();
      img.src = url;

      this.loadedImages.add(url);
    });
  }
}
