# scrollBar.js
> parent node must be set width(or height)

custom scrollBar.
<h3>usage</h3>
<pre>
var bodyScrollBar = new ScrollBar(document.body,{
  // barY : true,
  // barX : true,
  // onscroll : function(scrollTop,scrollLeft){
    // do something...
  // }
});

new ScrollBar(document.getElementById("box"));

window.onresize = function(){
  bodyScrollBar.resize();
};
</pre>
