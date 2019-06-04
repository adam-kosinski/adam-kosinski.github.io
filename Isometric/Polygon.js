class Polygon
{
	constructor(color,vertices) //
	{
		if(vertices.length < 3){throw new Error("error creating polygon - must have 3 or more vertices")}
		this.color = color;
		this.p = vertices; //array of vertices, in order; p[0] would mean "point 0"
		this.normal = new Vector(this.p[0],this.p[1]).cross(new Vector(this.p[1],this.p[2]));
	}
}