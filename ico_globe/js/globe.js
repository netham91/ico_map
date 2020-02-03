
var width = 960,
    height = 700;

var proj = d3.geoOrthographic()
    .scale(320)
    .translate([width / 2, height / 2])
// change this to 180 for transparent globe
    .clipAngle(90);


var path = d3.geoPath().projection(proj).pointRadius(1.5);

var graticule = d3.geoGraticule();
  
var london = [-0.118667702475932, 51.5019405883275];
  
var time = Date.now();
var rotate = [39.666666666666664, -30];
var velocity = [.005, -0];

var detailsData;

var lastTime;
var waitDelay = 3000;
var isSpinning = true;
  
var lineToLondon = function(d) {
  return path({"type": "LineString", "coordinates": [london, d.geometry.coordinates]});
}

function stripWhitespace(str) {
  return str.replace(" ", "");
}


convertJson();
function convertJson(){

   d3.csv("resources/details.csv",function(ddata){
     console.log("ddata",ddata);
     detailsData = ddata;
   })

   d3.csv( "resources/data.csv",function(mdata){
      console.log(mdata)
      //build the json
     var mapData = {};
      mapData.type = "FeatureCollection";
      mapData.features = [];

      

      mdata.forEach(function(item,index,arr){
        var point = {};
        point.type = "Feature";
        point.properties = {};
        point.properties.name = item.name;
        point.properties.l1 = item.l1;
        point.properties.l2 = item.l2;
        point.properties.l3 = item.l3;
        point.properties.l4 = item.l4;
        point.properties.l5 = item.l5;

      

        point.geometry = {};
        point.geometry.type = "Point";
       

        shiftLat = 0.1;
        shiftLat = 0.1;

        if(item.l1 == "1"){
          point.properties.class = "label label-l1";
          point.geometry.coordinates = [ parseFloat(item.longitude), parseFloat(item.latitude)];

          mapData.features.push(point);
        }
        if(item.l2 == "1"){

          const point2 = JSON.parse(JSON.stringify(point));

          point2.properties.class = "label label-l2";
           point2.geometry.coordinates = [ parseFloat(item.longitude) + shiftLat, parseFloat(item.latitude) + shiftLat];

          mapData.features.push(point2);
        }
        if(item.l3 == "1"){

          const point3 = JSON.parse(JSON.stringify(point));

          point3.properties.class = "label label-l3";
           point3.geometry.coordinates = [ parseFloat(item.longitude)- shiftLat, parseFloat(item.latitude)-shiftLat];

          mapData.features.push(point3);
        }
         if(item.l4 == "1"){

          const point4 = JSON.parse(JSON.stringify(point));

          point4.properties.class = "label label-l4";
           point4.geometry.coordinates = [ parseFloat(item.longitude)- shiftLat, parseFloat(item.latitude)-shiftLat];

          mapData.features.push(point4);
        }
         if(item.l5 == "1"){

          const point5 = JSON.parse(JSON.stringify(point));

          point5.properties.class = "label label-l5";
           point5.geometry.coordinates = [ parseFloat(item.longitude)- shiftLat, parseFloat(item.latitude)-shiftLat];

          mapData.features.push(point5);
        }

        


      }) 

      console.log(mapData);

      console.log(JSON.stringify(mapData))


    });
}

var svg = d3.select(".globe-display").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class","globesvg")

svg.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on('end', dragended)
        )

queue()
    .defer(d3.json, "resources/110m.json")
    .defer(d3.json, "resources/locData.json")
    // .defer(d3.json, "destinations.json",function(data){
    //   console.log(data);
    // })
   
    .await(ready);

function ready(error, world, places) {
    svg.append("circle")
        .attr("cx", width / 2)
      	.attr("cy", height / 2)
        .attr("r", proj.scale())
        .attr("class", "noclicks")
    		.attr("fill", "none");
    
    svg.append("path")
        .datum(topojson.object(world, world.objects.land))
        .attr("class", "land")
        .attr("d", path);

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule noclicks")
        .attr("d", path);

    svg.append("g").attr("class","points")
        .selectAll("text").data(places.features)
      .enter().append("path")
        .attr("class", "point")
        .attr("d", path);
  
  	// svg.append("g").attr("class","lines")
   //      .selectAll(".lines").data(places.features)
   //    .enter().append("path")
   //      .attr("class", "lines")
   //  		.attr("id", d => stripWhitespace(d.properties.name))
   //      .attr("d", d => lineToLondon(d));


    svg.append("g").attr("class","labels")
        .selectAll("text").data(places.features)
      .enter().append("text")
      
      .attr("class", function(d){
        console.log(d)
       return d.properties.class;
      })
      .text(d => d.properties.name)
      .on("mouseover", (d) => {
        //console.log(d);
      	var name = stripWhitespace(d.properties.name);
        displayDetails(d);
     	})
      .on("click", (d) => {
        //console.log(d);
        var name = stripWhitespace(d.properties.name);
         displayDetails(d);
      })
    	.on("mouseout", (d) => {
      	var name = stripWhitespace(d.properties.name);
     	});
  
    svg.append("g").attr("class","countries")
      .selectAll("path")
        .data(topojson.object(world, world.objects.countries).geometries)
      .enter().append("path")
        .attr("d", path); 


       increaseFont() 
    position_labels();
  
  	  initSwitches();
  
  	refresh();
  
  	spin();
}


function displayDetails(obj){

  const d = JSON.parse(JSON.stringify(obj));
  console.log(d);
  html = "";
  cl = d.properties.class;
  k = cl.split(" ");
  y = k[1].split("-");
  console.log(y);
  n = y[1].replace("l","");
  html += "<div class='dbox box-"+n+"'> <h3 class='box-head'> "+d.properties.name+" </h3>";
  
  //find match

  k = 0;
  detailsData.forEach(function(item,index,arr){
    if(d.properties.name.trim() === item.name.trim()  ){
      k++;
      html += "<a href='"+item.url+"'' target='_blank' class='doclink'> "+item.description +" </a> <br/>" 
    }
  })

  html += "</div>";
   heightt = k*70+100

  if(heightt > 420)
    heightt = 400
  $(".data-display").animate({
    opacity: '1',
    heightt: heightt+'px',
  }, 500, function(){
 
  } );

   $(".data-display").html(html); 


}

function position_labels() {
  var centerPos = proj.invert([width/2,height/2]);

  svg.selectAll(".label")
    .attr("text-anchor", (d) => {
     // console.log(d);
      var x = proj(d.geometry.coordinates)[0];
      return x < width/2-20 ? "end" :
             x < width/2+20 ? "middle" :
             "start"
    })
    .attr("transform", (d) => {
      var loc = proj(d.geometry.coordinates),
        x = loc[0],
        y = loc[1];
      var offset = x < width/2 ? -5 : 5;
      return "translate(" + (x+offset) + "," + (y-2) + ")"
    })
    .style("display", (d) => {
      var d = d3.geoDistance(d.geometry.coordinates, centerPos);
      return (d > 1.57) ? 'none' : 'inline';
    })
    
}

function refresh() {
  svg.selectAll(".land").attr("d", path);
  svg.selectAll(".countries path").attr("d", path);
  svg.selectAll(".graticule").attr("d", path);
  svg.selectAll(".point").attr("d", path);
  svg.selectAll(".lines").attr("d", (d) => { if (d) { return lineToLondon(d); }});
  position_labels();
}

  
var timer;
  
function spin() {
  timer = d3.timer(function() {
    var dt = Date.now() -time;
    
    proj.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt]);
    
    refresh();
  });
}
  
function dragstarted() {
  timer.stop();
  v0 = versor.cartesian(proj.invert(d3.mouse(this)));
  r0 = proj.rotate();
  q0 = versor(r0);
  lastTime = d3.now();
}


function dragended() {
   now = d3.now()
  diff = now - lastTime;

  isSpinning = false;
  // if(diff>waitDelay)
  //   spin();
  // else
  //   dragended();


  //spin()
}
  
function dragged() {
  var v1 = versor.cartesian(proj.rotate(r0).invert(d3.mouse(this))),
      q1 = versor.multiply(q0, versor.delta(v0, v1)),
      r1 = versor.rotation(q1);
  proj.rotate(r1);
  refresh();
}


function initSwitches(){
  console.log("Toggle switch");
 // $(".switch-box input").toggle();

 $(".label").css("font-size","0px");
 $("#sw1").attr("checked",true);
 $(".label-l1").css("font-size","1em");

}

$(document).ready(function(){


  
})


function increaseFont(){
  for(k = 1 ; k < 6 ; k++)
$(".label-l"+k).css("font-size","1em") ;

}

$(document).on('change', ".switch-box input ", function() {  
  id = $(this).attr("id");
  console.log("Toggled"+id)
  getId = id.split("_");
  l = ".label-l"+getId[1];

  fontS = $(l).css("font-size")
  
  if(isSpinning == false){
    spin();
    isSpinning = true;
  }
  if(fontS == "0px"){
    $(l).css("font-size","1em") 
     console.log("grow",l,fontS);
  }
  else
    $(l).css("font-size","0px")
     console.log("disappear",l,fontS); 


})
