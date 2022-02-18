package gfx;

import java.awt.Color;
import java.util.Random;

public class RandomColor {

	private static Color color = new Color(100,100,100);
	
	private static int r=100,g=100,b=100;
	
	private static final int colorChangeSpeed = 20;
	
	public static void tick() {
		r+=new Random().nextInt(colorChangeSpeed)-(colorChangeSpeed/2-1);
		g+=new Random().nextInt(colorChangeSpeed)-(colorChangeSpeed/2-1);
		b+=new Random().nextInt(colorChangeSpeed)-(colorChangeSpeed/2-1);
		
		if(r<0)r=0;
		if(g<0)g=0;
		if(b<0)b=0;
		
		if(r>255)r=255;
		if(g>255)g=255;
		if(b>255)b=255;
		
		color=new Color(r,g,b);
		
	}
	
	public static Color pickColor() {
		return color;
	}
	
	
}
