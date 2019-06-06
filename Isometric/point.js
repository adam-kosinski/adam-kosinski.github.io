class Point {
	constructor(x,y,z=0){
		this.x = x;
		this.y = y;
		this.z = z;
	}
	
	//function to add a vector to the point and return the resulting point
	addVector = function(v)
	{
		return new Point(this.x+v.i, this.y+v.j, this.z+v.k);
	}
}