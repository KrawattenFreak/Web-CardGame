package gfx;

import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.IOException;

import javax.imageio.ImageIO;

public class ImageLoader {

	public static BufferedImage loadImage(String name) {
		try {
			return ImageIO.read(ImageLoader.class.getClassLoader().getResourceAsStream("gfx/" + name+ ".png"));
		} catch (Exception e) {
			if(e instanceof IllegalArgumentException)
				System.err.println("Image: "+name+ " not found");
			else e.printStackTrace();
		}
		return null;
	}
	
	public static BufferedImage rotateImage(BufferedImage image, double degrees) {
		AffineTransform at = AffineTransform.getRotateInstance(Math.toRadians(degrees), image.getWidth() / 2, image.getHeight() / 2);
		BufferedImage rotatedImage = new BufferedImage(image.getWidth(), image.getHeight(), image.getType());
		Graphics2D g = (Graphics2D) rotatedImage.getGraphics();
		g.setTransform(at);
		g.drawImage(image, 0, 0, null);
		return rotatedImage;
	}
	
	
}
