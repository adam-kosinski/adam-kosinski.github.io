class Vector
{
	constructor(a,b,c=0)
	{
		if(typeof a === "number" && typeof b === "number" && typeof c === "number") //then we gave it i,j,k
		{
			this.i = a;
			this.j = b;
			this.k = c;
		}
		else if(a instanceof Point && b instanceof Point) //then we gave it two points, going a to b
		{
			this.i = b.x - a.x;
			this.j = b.y - a.y;
			this.k = b.z - a.z;
		}
		else
		{
			throw new Error("incorrect input to make new vector");
		}
		
		//calculate magnitude
		this.mag = Math.sqrt(this.i**2 + this.j**2 + this.k**2);
	}
	
	//function to return unit vector
	unit() {
		return this.scale(1/this.mag);
	}
	
	//scale by a number scalar
	scale(scalar)
	{
		return new Vector(this.i*scalar, this.j*scalar, this.k*scalar);
	}
	
	add(v)
	{
		return new Vector(this.i + v.i, this.j + v.j, this.k + v.k);
	}
	
	subtract(v)
	{
		return this.add(v.scale(-1));
	}
	
	//dot product with vector v
	dot(v)
	{
		return this.i * v.i + this.j * v.j + this.k * v.k;
	}
	
	cross(v) //calculates: this_vector cross v
	{
		return new Vector(this.j*v.k - this.k*v.j, -(this.i*v.k - this.k*v.i), this.i*v.j - this.j*v.i);
	}
	
	projectOntoVector(v) //v being the vector on which to project
	{
		let proj_mag = this.dot(v)/v.mag;
		return v.unit().scale(proj_mag);
	}
	
	projectOntoPlane(plane)
	{
		let normal_proj = this.projectOntoVector(plane.normal);
		return this.subtract(normal_proj);
	}
}