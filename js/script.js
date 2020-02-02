//
// Configuration
//

// ms to wait after dragging before auto-rotating
var rotationDelay = 3000
// scale of the globe (not the canvas element)
var scaleFactor = 0.9
// autorotation speed
var degPerSec = 20
// start angles
var angles = { x: -20, y: 40, z: 0}
// colors
var colorWater = '#fff'
var colorLand = '#111'
var colorGraticule = 'black'
var colorCountry = '#a00'
var countryDBox = [];
var countryCBox = [];
var locations = [];


const svg = d3.select('svg')
                .attr('width', width).attr('height', height);
            const markerGroup = svg.append('g');
//const markerGroup = svg.append('g');

var countryData = d3.csv('resources/dataNew.csv', function( countries) {
      
     

        console.log(countries);
        k = 0;
        for (var i = countries.length - 1; i >= 0; i--) {
          countryDBox[ parseInt(countries[i].id) ] = countries[i];

          countryDBox[ parseInt(countries[i].id) ]["l1"] = parseInt(countries[i]["l1"])
           countryDBox[ parseInt(countries[i].id) ]["l2"] = parseInt(countries[i]["l2"])
            countryDBox[ parseInt(countries[i].id) ]["l3"] = parseInt(countries[i]["l3"])

            locations[ k ] = {}
            locations[ k ]["latitude"] = countries[i].latitude
            locations[ k]["longitude"] = countries[i].longitude
            k++;
        }




        console.log(countryDBox);
       // for (var i = Things.length - 1; i >= 0; i--) {
       //    Things[i]
       //  } 
      return countries;
     // cb(world, countries)
    })




//
// Handler
//

function enter(countryy) {
 // console.log(countryy);
  var country = countryList.find(function(c) {
    return c.id === countryy.id
  })

  //  var country = countryList.find(function(c) {
  //   return c.id === country.id
  // })
if( countryy.id in countryDBox ){
    current.text(country && countryDBox[countryy.id].name || '')    
}
else

  current.text(country && countryy.name || '')
}

function leave(country) {
  current.text('')
}

//
// Variables
//

var current = d3.select('#current')
var canvas = d3.select('#globe')
var context = canvas.node().getContext('2d')
var water = {type: 'Sphere'}
var projection = d3.geoOrthographic().precision(0.1)
var graticule = d3.geoGraticule()
var path = d3.geoPath(projection).context(context)
var v0 // Mouse position in Cartesian coordinates at start of drag gesture.
var r0 // Projection rotation as Euler angles at start.
var q0 // Projection rotation as versor at start.
var lastTime = d3.now()
var degPerMs = degPerSec / 1000
var width, height
var land, countries
var countryList
var autorotate, now, diff, roation
var currentCountry

//
// Functions
//

function setAngles() {
  var rotation = projection.rotate()
  rotation[0] = angles.y
  rotation[1] = angles.x
  rotation[2] = angles.z
  projection.rotate(rotation)
}

function scale() {
  width = document.documentElement.clientWidth
  height = document.documentElement.clientHeight
  canvas.attr('width', width).attr('height', height)
  projection
    .scale((scaleFactor * Math.min(width, height)) / 2)
    .translate([width / 2, height / 2])
  render()
}

function startRotation(delay) {
  autorotate.restart(rotate, delay || 0)
}

function stopRotation() {
  autorotate.stop()
}

function dragstarted() {
  v0 = versor.cartesian(projection.invert(d3.mouse(this)))
  r0 = projection.rotate()
  q0 = versor(r0)
  stopRotation()
}

function dragged() {
  var v1 = versor.cartesian(projection.rotate(r0).invert(d3.mouse(this)))
  var q1 = versor.multiply(q0, versor.delta(v0, v1))
  var r1 = versor.rotation(q1)
  projection.rotate(r1)
  render()
}

function dragended() {
  startRotation(rotationDelay)
}

function render() {
  context.clearRect(0, 0, width, height)

  context.fillStyle = "white";
context.fillRect(0, 0, width, height);


  fill(water, "#D5F5F7")
  stroke(graticule, colorGraticule)


  // if(countryDBox[currentCountry.])
  //console.log(land);
  fill(land, "grey")

  // for (var   = countries.length - 1;   >= 0;  --) {
    


  // }


 if (currentCountry) {

    
    //console.log(currentCountry);
    fill(currentCountry, "grey")
  }



  // countryDBox.forEach(function(item,index,arr){

  //   if(item.l1 == 1){
  //     fill(countryCBox[index], "#DA0000")
  //   }
  //   else if(item.l2 == 1){
  //     fill(countryCBox[index], "#F4D800")
  //   }
  //   else if( item.l3 == 1){
  //     fill(countryCBox[index], "#0478ED")
  //   }



  // })


  //plot markers


  //countryDBox
}




function fill(obj, color) {
  context.beginPath()
  path(obj)
  context.fillStyle = color
  context.fill()
}

function stroke(obj, color) {
  context.beginPath()
  path(obj)
  context.strokeStyle = color
  context.stroke()
}

function rotate(elapsed) {
  now = d3.now()
  diff = now - lastTime
  if (diff < elapsed) {
    rotation = projection.rotate()
    rotation[0] += diff * degPerMs
    projection.rotate(rotation)
    render()
  }
  lastTime = now
}

function loadData(cb) {
  d3.json('resources/110m.json', function(error, world) {
    if (error) throw error
    d3.tsv('resources/world-country-names.tsv', function(error, countries) {
      if (error) throw error
      cb(world, countries)
    })
  })
}

// https://github.com/d3/d3-polygon
function polygonContains(polygon, point) {
  var n = polygon.length
  var p = polygon[n - 1]
  var x = point[0], y = point[1]
  var x0 = p[0], y0 = p[1]
  var x1, y1
  var inside = false
  for (var i = 0; i < n; ++i) {
    p = polygon[i], x1 = p[0], y1 = p[1]
    if (((y1 > y) !== (y0 > y)) && (x < (x0 - x1) * (y - y1) / (y0 - y1) + x1)) inside = !inside
    x0 = x1, y0 = y1
  }
  return inside
}

function mousemove() {
  var c = getCountry(this)
  if (!c) {
    if (currentCountry) {
      leave(currentCountry)
      currentCountry = undefined
      render()
    }
    return
  }
  if (c === currentCountry) {
    return
  }
  currentCountry = c
  render()
  enter(c)
}

function getCountry(event) {
  var pos = projection.invert(d3.mouse(event))
  return countries.features.find(function(f) {
    return f.geometry.coordinates.find(function(c1) {
      return polygonContains(c1, pos) || c1.find(function(c2) {
        return polygonContains(c2, pos)
      })
    })
  })
}


//
// Initialization
//

setAngles()

canvas
  .call(d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
   )
  .on('mousemove', mousemove)

loadData(function(world, cList) {
  land = topojson.feature(world, world.objects.land)
  countries = topojson.feature(world, world.objects.countries)

  // for (var i = countries.features.length - 1; i >= 0; i--) {
  //   countryCBox[ parseInt( countryCBox.features[i].id ) ] = countryCBox.features[i]; 
  // }

  countries.features.forEach( function (item, index, arr){
    countryCBox[ parseInt( item.id ) ] = item;  
  });




  console.log(land);
  console.log(countries);
  console.log(countryCBox);
  countryList = cList
  
  window.addEventListener('resize', scale)
  scale()
  autorotate = d3.timer(rotate)
})