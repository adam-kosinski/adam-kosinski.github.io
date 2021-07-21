function updateShadowPolygons(mouse_pos){
  if(mouse_pos[0] === undefined || mouse_pos[1] === undefined){
    console.log("missing mouse pos");
    return;
  }

  shadow_polygons = []; //clear previous ones

  polygons.forEach(poly => {
    //create a shadow polygon for each edge
    for(let i=0; i<poly.vertices.length; i++){
      let v0 = poly.vertices[i];
      let v1 = poly.vertices[(i+1)%poly.vertices.length];

      //vectors from mouse, through edge vertices, with length SHADOW_DISTANCE (will extend length later if necessary)
      let vector0 = math.subtract(v0, mouse_pos);
      let vector1 = math.subtract(v1, mouse_pos);
      vector0 = math.multiply(SHADOW_DISTANCE/math.norm(vector0), vector0);
      vector1 = math.multiply(SHADOW_DISTANCE/math.norm(vector1), vector1);

      let vfar_1 = math.add(mouse_pos, vector1); //no need to find vfar_0, it's the last vertex added of the smoothing vertices
      let shadow_vertices = [v0, v1, vfar_1];

      //smoothing - add lots of vertices to fill in the outer edge of the shadow to make it more circular
      //sweep from vector1 direction to vector0, d_theta may be negative
      let signed_shadow_angle = Math.atan2(vector0[1], vector0[0]) - Math.atan2(vector1[1], vector1[0]);
      if(signed_shadow_angle > Math.PI) signed_shadow_angle -= 2*Math.PI;
      else if(signed_shadow_angle < -Math.PI) signed_shadow_angle += 2*Math.PI;

      let d_theta = signed_shadow_angle / N_SMOOTHING_SEGMENTS;
      let rotation_matrix = [
        [Math.cos(d_theta), -Math.sin(d_theta)],
        [Math.sin(d_theta), Math.cos(d_theta)]
      ];
      let rotating_vector = vector1; //sweeping starting at vector1
      for(let n=1; n<=N_SMOOTHING_SEGMENTS; n++){
        rotating_vector = math.multiply(rotation_matrix, rotating_vector);
        let prev = shadow_vertices[shadow_vertices.length-1];
        let current = math.add(mouse_pos, rotating_vector);

        //if outer shadow edge intersects with the obstacle polygon edge, make sure there's a vertex at the intersection
        //so when we push the current vertex to beyond the edge, we don't change the shadow's shape
        let intersect = math.intersect(prev, current, v0, v1);
        if (intersect &&
            //check if intersection on line segments not just line
            intersect[0] > Math.min(v0[0], v1[0]) && intersect[0] < Math.max(v0[0], v1[0]) &&
            intersect[1] > Math.min(v0[1], v1[1]) && intersect[1] < Math.max(v1[1], v1[1]) &&
            intersect[0] > Math.min(prev[0], current[0]) && intersect[0] < Math.max(prev[0], current[0]) &&
            intersect[1] > Math.min(prev[1], current[1]) && intersect[1] < Math.max(prev[1], current[1]))
        {
            shadow_vertices.push(intersect);
        }
        shadow_vertices.push(current);
      }

      //extend any vertices that don't make it to the polygon's edge, to ensure the whole shadow is
      //on the opposite side as the mouse
      for(let k=0; k<shadow_vertices.length; k++){
        let v = shadow_vertices[k];
        let intersect = math.intersect(v, mouse_pos, v0, v1);
        if(intersect){
          let dist_to_edge = math.norm(math.subtract(intersect, mouse_pos));
          if(dist_to_edge > SHADOW_DISTANCE){
            shadow_vertices[k] = intersect;
          }
        }
      }

      //add shadow polygon to storage
      if(i==0) shadow_polygons.push(new ShadowPolygon(shadow_vertices));
    }

  });
}
