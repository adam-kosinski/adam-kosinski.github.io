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

      //vectors from mouse, through edge vertices, with length SHADOW_DISTANCE (or just dist to vertex if that's larger)
      let vector0 = math.subtract(v0, mouse_pos);
      let vector1 = math.subtract(v1, mouse_pos);
      if(SHADOW_DISTANCE > math.norm(vector0)) vector0 = math.multiply(SHADOW_DISTANCE/math.norm(vector0), vector0);
      if(SHADOW_DISTANCE > math.norm(vector1)) vector1 = math.multiply(SHADOW_DISTANCE/math.norm(vector1), vector1);

      let vfar_0 = math.add(mouse_pos, vector0);
      let vfar_1 = math.add(mouse_pos, vector1);

      let shadow_vertices = [v0, v1, vfar_1]; //add vfar_0 after smoothing

      //smoothing - add lots of vertices to fill in the outer edge of the shadow to make it more circular
      //sweep from vector1 direction to vector0, d_theta may be negative
      let signed_shadow_angle = Math.atan2(vector0[1], vector0[0]) - Math.atan2(vector1[1], vector1[0]);
      if(signed_shadow_angle > Math.PI) signed_shadow_angle -= 2*Math.PI;
      else if(signed_shadow_angle < -Math.PI) signed_shadow_angle += 2*Math.PI;

      if(i==0) console.log(Math.atan2(vector0[1], vector0[0])/Math.PI, Math.atan2(vector1[1], vector1[0])/Math.PI, signed_shadow_angle/Math.PI);
      let d_theta = signed_shadow_angle / N_SMOOTHING_SEGMENTS;
      let rotation_matrix = [
        [Math.cos(d_theta), -Math.sin(d_theta)],
        [Math.sin(d_theta), Math.cos(d_theta)]
      ];
      let rotating_vector = vector1; //sweeping starting at vector1
      for(let n=1; n<=N_SMOOTHING_SEGMENTS-1; n++){ //-1 because endpoints already taken care of
        rotating_vector = math.multiply(rotation_matrix, rotating_vector);
        shadow_vertices.push(math.add(mouse_pos, rotating_vector));
      }

      shadow_vertices.push(vfar_0);
      shadow_polygons.push(new ShadowPolygon(shadow_vertices));
    }

  });
}
