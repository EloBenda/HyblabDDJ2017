'use strict';

// No need for window.onload event here since we are using the def attribute
// when loading our scripts
//setTimeout(function(){

function initDataviz2() {  
    var arrayColor = {"association" : "#96B2F4","budget" : "#5A7DEE","couts-des-services" : "#001DC3","culture" : "#00F365","education" : "#00F02B","election" : "#7897F1","Environnement" : "#00F7BE","equipements" : "#00F483","marche-public" : "#1E47E9","permis-de-construire" : "#3C62EB","pv-deliberations" : "#C3DBF8","subventions" : "#B4CDF6","transport" : "#00F6A0","urbanisme" : "#00F9DB", "France" : "none"}; 
    var regions = ["Auvergne-Rhone-Alpes","Bourgogne-Franche-Comte","Bretagne","Centre-Val-de-Loire","Corse","Grand-Est","Hauts-de-France","Ile-de-France","Normandie","Nouvelle-Aquitaine","Occitanie","Pays-de-la-Loire","Provence-Alpes-Cote-d-Azur"]; 
    var arrayRegionsX = {"Auvergne-Rhone-Alpes" : 107,"Bourgogne-Franche-Comte" : 29,"Bretagne" : -94,"Centre-Val-de-Loire" : -109,"Corse" : 239,"Grand-Est" : 348,"Hauts-de-France" : 131,"Ile-de-France" : 150,"Normandie" : -85,"Nouvelle-Aquitaine" : -189,"Occitanie" : -140,"Pays-de-la-Loire" : -329,"Provence-Alpes-Cote-d-Azur" : 72}
    var arrayRegionsY = {"Auvergne-Rhone-Alpes" : -8,"Bourgogne-Franche-Comte" : 98,"Bretagne" : -287,"Centre-Val-de-Loire" : 49,"Corse" : 363,"Grand-Est" : -136,"Hauts-de-France" : -287,"Ile-de-France" : -13,"Normandie" : 41,"Nouvelle-Aquitaine" : -86,"Occitanie" : 119,"Pays-de-la-Loire" : 48,"Provence-Alpes-Cote-d-Azur" : 310}

    var svg = d3.select("#circleChart"),
    margin = 20,
    diameter = 500, 
    //diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);

    var root = d3.hierarchy(datavizCircle())
        .sum(function(d) { return d.size; })
        .sort(function(a, b) { return b.value - a.value;}); 

  var focus = root,
      nodes = pack(root).descendants(),
      view;

    nodes.forEach(function(item){

        if(item.data.id in arrayRegionsX ){
            item.r -= 0.5; 
            item.x += arrayRegionsX[item.data.id];
            item.y += arrayRegionsY[item.data.id];  
        }
        if((item.data.id != "France") && (item.parent.data.id in arrayRegionsX)){
            item.x += arrayRegionsX[item.parent.data.id];
            item.y += arrayRegionsY[item.parent.data.id]; 
        }
    }); 

/*
    nodes[1].x =  310; 
    nodes[1].y =  265; 
  
    // Bourgogne
    nodes[10].x = 392;
    nodes[10].y = 180; 

    // GE 
    nodes[6].x = 423;
    nodes[6].y = 90;

    // IDF 
    nodes[5].x = 305;
    nodes[5].y = 125;

    // Val de loire
    nodes[4].x = 175;
    nodes[4].y = 200;

    // Normandie
    nodes[12].x = 148;
    nodes[12].y = 108;

    //Bretagne 
    nodes[8].x = 70;
    nodes[8].y = 115;

    //PDL
    nodes[9].x = 63;
    nodes[9].y = 205;

    //Nouvelle Aquitaine
    nodes[3].x = 95;
    nodes[3].y = 315;

    // Occitanie
    nodes[2].x = 220;
    nodes[2].y = 392;

    // HF
    nodes[7].x = 215;
    nodes[7].y = 50;

    // PACA
    nodes[11].x = 340;
    nodes[11].y = 380;

    // Corse
    nodes[13].x = 425;
    nodes[13].y = 445;
    */

  var circle = g.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
    .style("fill-opacity", function(d){
        if(!(d.data.id in arrayColor)){
            return "0"; 
        }
    })
    .style("fill", function(d) { 
        if(d.data.id in arrayColor){
            return arrayColor[d.data.id];
        }
        else{
            return "#ffffff";
        }
    })
    .on("click", function(d) { updateDownload(d.data.id, d.data.name); if (focus !== d) zoom(d), d3.event.stopPropagation(); });

  var text = g.selectAll("text")
    .data(nodes)
    .enter().append("text")
      .attr("class", "label")
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
      .text(function(d) { return d.data.name; });

    var node = g.selectAll("circle,text");

    svg
      //.style("background", "#FFFFFF")
      .style("background-image", "url(\"img/france/france.svg\")")
      //.style("background-position","-5% -3%")
      .style("background-size", "100%")
      .style("background-repeat", false)
      .on("click", function() { updateDownload("france", "france");zoom(root); });

  zoomTo([root.x, root.y, root.r * 2 + margin]);

  function zoom(d) {
    var focus0 = focus; focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
       .filter(function(d) {
          if(!(d === undefined))
          {
            return d.parent === focus || this.style.display === "inline";
          }
        })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }

  function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
  }

    var data = datavizDownLoad();

    new Chartist.Pie('#downloadChart', {
      series: [{value : data["couts-des-services"], className : "Cservices"},
                {value : data["marche-public"], className : "Cmarche"},
                {value : data["permis-de-construire"], className : "Cconstruire"}, 
                {value : data["budget"], className : "Cbudget"}, 
                {value : data["election"], className : "Celection"}, 
                {value : data["association"], className : "Cassociation"}, 
                {value : data["subventions"], className : "Csubventions"}, 
                {value : data["pv-deliberations"], className : "Cpv"}, 
                {value : data["urbanisme"], className : "Curbanisme"}, 
                {value : data["Environnement"], className : "Cenvironnement"},
                {value : data["transport"], className : "Ctransport"},
                {value : data["equipements"], className : "Cequipements"},
                {value : data["culture"], className : "Cculture"}, 
                {value : data["education"], className : "Ceducation"}]}, 
    {
        chartPadding: 0,
        donut: true,
        donutWidth: 40,
        startAngle: 270,
        total: data["all"]*2,
        showLabel: false
    });

     $("#textDownload").html("FRANCE <br>"+ Math.round(data["all"]) + " téléchargements de données"); 

    regions.forEach(function(region){
        fetch("img/france/"+region+".svg").then(function (response){
                // if we could load the resource, parse it
                if( response.ok )
                    return true;
                else // if not, send some error message as JSON data
                    return false;
        });
    }); 
}
//}, 8000);

function updateDownload(region, regionName){
    var data = datavizDownLoad(region);

    new Chartist.Pie('#downloadChart', {
      series: [{value : data["couts-des-services"], className : "Cservices"},
                {value : data["marche-public"], className : "Cmarche"},
                {value : data["permis-de-construire"], className : "Cconstruire"}, 
                {value : data["budget"], className : "Cbudget"}, 
                {value : data["election"], className : "Celection"}, 
                {value : data["association"], className : "Cassociation"}, 
                {value : data["subventions"], className : "Csubventions"}, 
                {value : data["pv-deliberations"], className : "Cpv"}, 
                {value : data["urbanisme"], className : "Curbanisme"}, 
                {value : data["Environnement"], className : "Cenvironnement"},
                {value : data["transport"], className : "Ctransport"},
                {value : data["equipements"], className : "Cequipements"},
                {value : data["culture"], className : "Cculture"}, 
                {value : data["education"], className : "Ceducation"}]}, 
    {
        chartPadding: 0,
        donut: true,
        donutWidth: 40,
        startAngle: 270,
        total: data["all"]*2,
        showLabel: false
    });

    var white = "";

    if( Math.round(data["all"]) < 10 ){
        white = "&nbsp;&nbsp;&nbsp;&nbsp;"; 
    }
    else if( Math.round(data["all"]) < 1000 ){
        white = "&nbsp;&nbsp;&nbsp;"; 
    }
    else if (Math.round(data["all"]) < 10000 ){
        white = "&nbsp;&nbsp;"; 
    }
    else if (Math.round(data["all"]) < 100000){
        white = "&nbsp;"; 
    } 

    setTimeout(function(){
            $("#textDownload").html(regionName.toUpperCase() + "<br>"+ white  +  Math.round(data["all"]) + " téléchargements de données")
            $("#circleChart").css("background-image", "url(\"img/france/"+region+".svg\")")
                             .css("background-position","0px 0px")
                             .css("background-size", "100%")
    },"500"); 
    
} 

/*
$(document).ready(function(){
    window.addEventListener("resize", function () {
        if (window.innerWidth() <= 1150) {
             $('.').css({ fill: "#ff0000" });
        };
    });
}*/