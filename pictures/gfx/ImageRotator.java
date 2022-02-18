package gfx;

import java.awt.image.BufferedImage;

public class ImageRotator {

	BufferedImage[] images = new BufferedImage[360];
	
	
	public ImageRotator(BufferedImage image) {
		for(int i = 0; i<360;i++) {
			images[i] = ImageLoader.rotateImage(image, i);
			//System.err.println("LoadDegrees: "+i + "<"+image+">");
		}
	}
	
	public BufferedImage getRotatedImage(int degrees) {
		while (degrees>=360) {
			degrees-=360;
		}
		
		while (degrees<=1) {
			degrees+=359;
		}
		if(degrees==360) degrees=1;
		
		return images[degrees];
	}
	
}
