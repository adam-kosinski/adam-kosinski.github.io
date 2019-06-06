class Polygon
{
	constructor(color,vertices) //vertices is an array of Point objects
	{
		if(vertices.length < 3){throw new Error("error creating polygon - must have 3 or more vertices")}
		this.color = color;
		this.v = vertices; //array of vertices, in order; p[0] would mean "point 0"
		this.normal = new Vector(this.v[0],this.v[1]).cross(new Vector(this.v[1],this.v[2]));
	}
}