/* Javascript */
$(document).ready(function() {
	// Obtain a reference to the canvas element
	// using its id.
	var canvas = document.getElementById('myCanvas');
	var context = canvas.getContext('2d');

	var disDisplay = document.getElementById("dist");
	var angDisplay = document.getElementById("angle");

	var instructionCheckoffCounter = 1;
	// var checkoffItemsDone = {
	// 	setUpCtrlPnt1 : false,
	// 	useCtrlPnt2AsBackSight : false,
	// 	layOutPntA90DegfromCntlLine : false,
	// 	layOutPntA25FtfromCntlPnt1 : false
	// };

	// Set our global variables
	var isDrag = false;
	var mSelect = null;
	var zSet = { sx: 0, sy: 0, px: 0, py: 0};
	var isZSetActive = false;
	var mouse = { xOff: 0, yOff: 0 };
	var intervalId = 0;

	// Our image resources
	var imgSize = {x: 46, y: 46};
	var sources = {
		station: { src: 'images/SymbolOfSurveyingTotalStation.png', x: 10, y: 25 },
		prism: { src: 'images/Prism.png', x: 10, y: 100 }
	};



	// Start listening to resize events and
	var x1 = sources.prism.x + (imgSize.x / 2);
	var y1 = sources.prism.y + (imgSize.y / 2);
	var x2 = sources.station.x + (imgSize.x / 2);
	var y2 = sources.station.y + (imgSize.y / 2);

	var getXY = {
		station: 	function(){
			return {
				x: sources.station.x + (imgSize.x / 2),
				y: sources.station.y + imgSize.y }
			},
		prism: 	function(){
			return {
				x: sources.prism.x + (imgSize.x / 2),
				y: sources.prism.y + (imgSize.y / 2)
			}
		}
	};

	var getTopLeft = {
		station: 	function(s){
			return {
				x: s.x - (imgSize.x / 2),
				y: s.y - imgSize.y }
			},
		prism: 	function(p){
			return {
				x: p.x - (imgSize.x / 2),
				y: p.y - (imgSize.y / 2)
			}
		}
	};

	function snapToPoint(point){
		var _buf = 15;
		for(var _cp in control){
			if( isOverImage(mSelect) ){
				 if( distance(control[_cp],point) <= _buf ) {
					startTimer();
					return getTopLeft[mSelect]({ x: control[_cp].x, y: control[_cp].y});
				}
			}
		}
		
		for(var _sp in setPoints)
			if(isOverImage(mSelect)){
				if( distance(setPoints[_sp],point) <= _buf) {
				startTimer();
				return getTopLeft[mSelect]({x: setPoints[_sp].x, y: setPoints[_sp].y});
				}
			}
	
		
		return {x: (mouse.x - mouse.xOff), y: (mouse.y - mouse.yOff)};
	}

	function mMove(e){
		if(isDrag){
			var sCor = snapToPoint( getXY[mSelect]() );
			sources[mSelect].x = sCor.x;
			sources[mSelect].y = sCor.y;
		}
	}

	function convertDDToDMS(dd){
		let posObject = {}
		posObject.deg = Math.floor(dd);
		let frac = Math.abs(dd - posObject.deg);
		posObject.minutes = Math.abs(frac * 60) | 0;
		posObject.seconds = Math.abs(frac * 3600 - posObject.minutes * 60) | 0;
		return posObject;
	}

	function angle() {

		if(isZSetActive){
			let A = getXY["prism"]();
			let B = getXY["station"]();
			let C = {x: zSet.px, y: zSet.py};

			let AB = Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2);
			let BC = Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2);
			let AC = Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2);

			let angle = convertDDToDMS(radianToDegrees(Math.acos((BC + AB - AC)/(2 * Math.sqrt(BC) * Math.sqrt(AB)))));

			// console.log(angle);

			angDisplay.innerHTML = `${angle.deg}&deg; ${angle.minutes}' ${angle.seconds}"`
		} else {
			angDisplay.innerHTML = "N/A";
		}
	}

	function radianToDegrees(r){
		var angle = ( r * (180/3.14159) );
		return angle.toFixed(1);
	}

	function isOverImage(sName){
		if(isZSetActive && sName === "station" ){ return false; }
		if(mouse.x >= sources[sName].x && mouse.x <= (sources[sName].x + imgSize.x)){
			if(mouse.y >= sources[sName].y && mouse.y <= (sources[sName].y + imgSize.y)){
				return true;
			}
		}
		return false;
	}

	function mDown(){
		for(var src in sources){
			if(isOverImage(src)){

				mouse.xOff = mouse.x - sources[src].x;
				mouse.yOff = mouse.y - sources[src].y;

				mSelect = src;
				isDrag = true;
				canvas.onmousemove = mMove;
				return;
			}
		}
	}

	function displayCheckedOffItem() {
		// this function places a checkmark off of each item in the instructions menu as each are done
		switch (instructionCheckoffCounter) {
			case 1:
				document.getElementById('checkoff1').innerHTML = 'done';
				console.log(document.getElementById('demo').innerHTML = 'got first point');
				instructionCheckoffCounter++;
				break;
			case 2:
				document.getElementById('checkoff2').innerHTML = 'done';
				console.log(document.getElementById('demo').innerHTML = 'got second point');
				instructionCheckoffCounter++;
				break;
			case 3:
				document.getElementById('checkoff3').innerHTML = 'done';
				console.log(document.getElementById('demo').innerHTML = 'got third point');
				instructionCheckoffCounter++;
				break;
			case 4:
				document.getElementById('checkoff4').innerHTML = 'done';
				console.log(document.getElementById('demo').innerHTML = 'got fourth point');
				instructionCheckoffCounter++;
				break;
			default:
				// the other conditions were not met, therefore break (out a little break dance)
				break;
		}
	}

	function mUp(){
		// console.log("Mouse has been released at " + mouse.x + ", " + mouse.y);
		isDrag = false;
		canvas.onmousemove = null;
		mSelect = null;
		displayCheckedOffItem();
	}

	function getMousePos(evt) {
		var rect = canvas.getBoundingClientRect();
		mouse.x = evt.clientX - rect.left;
		mouse.y = evt.clientY - rect.top;
	}

	function drawScale() {
		//Scale 
		var scaleLocX = 100 // Use this to move scale location on page horizontally.
		var scaleLocY = 550 // Use this to adjust Scale location page vertically.

		// Do not change anything regarding scale location below this line. 
		context.beginPath();
		context.fillRect(scaleLocX , scaleLocY, 10, 5);
		context.fillRect(scaleLocX + 10, scaleLocY + 5, 10, 5);
		context.fillRect(scaleLocX + 20, scaleLocY, 10, 5);
		context.fillRect(scaleLocX + 30, scaleLocY + 5, 10, 5);
		context.fillRect(scaleLocX + 40, scaleLocY, 10, 5);
		context.fillRect(scaleLocX + 50, scaleLocY + 5, 50, 5);
		context.fillRect(scaleLocX + 100, scaleLocY, 50, 5);
		context.fillRect(scaleLocX + 150, scaleLocY + 5, 100, 5);
		context.setLineDash([0, 0]);
		context.lineWidth=2;
		context.strokeStyle="black";
		context.rect(scaleLocX, scaleLocY, 250, 10)
		context.stroke();
		context.fillText("-5", scaleLocX - 10, scaleLocY - 10);
		context.fillText("0", scaleLocX + 45, scaleLocY - 10);
		context.fillText("5", scaleLocX + 95, scaleLocY - 10);
		context.fillText("10", scaleLocX + 142, scaleLocY - 10);
		context.fillText("20", scaleLocX + 240, scaleLocY - 10);
		// End of Scale
	}

	// Display custom canvas.
	// In this case it's a blue, 4 pixel border that
	// resizes along with the browser window.
	function controlPoints() {

		for( var cp in control ){
			context.beginPath();
			context.arc(control[cp].x, control[cp].y, 3, 0, 5 * Math.PI);
			context.label = cp;
			context.fill();
			context.font = "15px Arial";
			context.fillText(cp, control[cp].x + 10, control[cp].y);
		}
	}

	function distance(dsXY,dpXY) {
		var dx = dpXY.x - dsXY.x;
		var dy = dpXY.y - dsXY.y;

		var d = Math.sqrt((dx*dx) + (dy*dy));
		return d.toFixed(0);
	}

	function pretendDistance(d){
		d = d / 10;
		return d.toFixed(2)
	}

	function loadImages() {
		var drawIt = function(img,n){
			context.drawImage(img, n.x, n.y, imgSize.x, imgSize.y);
		};
		// get num of sources
		for(var n in sources) {
			var image = new Image();
			image.src = sources[n].src;
			image.onload = drawIt(image, sources[n]);
		}

		var sXY = getXY["station"]();
		var pXY = getXY["prism"]();

		// Draw our line between the images
		context.beginPath();
		context.lineWidth = '2';
		context.moveTo( sXY.x, sXY.y );
		context.lineTo( pXY.x, pXY.y );
		context.setLineDash([5, 5]);
		context.strokeStyle="blue";
		context.stroke();

		if(isZSetActive) {
			// Draw our zeroSet
			context.beginPath();
			context.moveTo(zSet.sx,zSet.sy);
			context.lineTo(zSet.px,zSet.py);
			context.strokeStyle="black";
			context.stroke();
		}
	}

	// Runs each time the DOM window resize event fires.
	// Resets the canvas dimensions to match window,
	// then draws the new borders accordingly.
	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	};

	function clearCanvas() {
		context.clearRect(0, 0, canvas.width, canvas.height)
	}

	function displayZeroSet() {
		// Look up Tenary Operators
		isZSetActive = isZSetActive ? false : true;

		var szXY = getXY["station"]();
		var pzXY = getXY["prism"]();

		zSet.sx = szXY.x;
		zSet.sy = szXY.y;
		zSet.px = pzXY.x;
		zSet.py = pzXY.y;
	}

	// Set initial question set control points
	var control = {
		CP1: { x: 200, y: 350 },
		CP2: { x: 200, y: 80 }
	};


	function changetoNextQuestion(arrNum) {
		//sets the page's active control points to whatever number is passed to arrNum
		controlArray = [
			{
			CP1: { x: 200, y: 350 },
			CP2: { x: 200, y: 100 },
			CP3: { x: 450, y: 350 },
			CP4: {x: 450, y: 100 }
		},
			{
			CP1: { x: 600, y: 250 },
			CP2: { x: 300, y: 90 },
			CP3: {x: 100, y: 200}
		}
		]
			control = controlArray[arrNum];
	}

	var questionNumber = 0
	function isCorrect() {
		// Runs to change to the next set of control points
		clearCanvas();
		if (questionNumber > 0 ) {
			questionNumber += 1
		}
		changetoNextQuestion(questionNumber);
	}

	// Temp button on index.html to test isCorrect function changes control points
	var nextQuestionBtn = document.getElementById('nextQuestionBtn');
	nextQuestionBtn.addEventListener("click", function() {
		isCorrect();
	});

	//--------------
	// TIMER
	//--------------

	var startTime;
	var finishTime;
	var completionTime;
	var timeStarted = false;


	function startTimer(){
		if(timeStarted == false){
			startTime = Date.now();
			document.getElementById("finish-btn").style.background="red";
			document.getElementById("finish-btn").innerHTML="finish";
		}
		timeStarted = true;
	}
		

   /*  STOP TIMER FUNCTION -- Waiting on Stake Point (SP1, SP2, etc) code.
 
 function stopTimer(){
        finishTime = Date.now();
        completionTime = (finishTime - startTime) / 1000;
        document.getElementById("time").innerHTML = " " + completionTime + " ";
    } */

	document.getElementById("finish-btn").onclick = function () {
		if(this.innerHTML === "finish"){
			finishTime = Date.now();
			completionTime = (finishTime - startTime) / 1000;
			document.getElementById("time").innerHTML = " " + completionTime + " ";
			this.style.display = "none";
		}
	}   /* end of timer section */
		


	//--------------
	// CREATE SET POINT
	//--------------

	// The Object holding all of the Setpoints created by clicking create set point button.
	var setPoints = {
	};

	// This function runs all the time in the draw function 
	function drawNewSetPoints() {

		for (var sp in setPoints) {
			context.beginPath();
			context.arc(setPoints[sp].x, setPoints[sp].y, 3, 0, 5 * Math.PI);
			context.label = 'sp';
			context.fill();
			context.font = "15px Arial";
			context.fillText(sp, setPoints[sp].x + 10, setPoints[sp].y);
		}

	}

	var createSetPointBtn = document.getElementById('createSetpointBtn');

	var num = 1
	// watch for button to be clicked to add new set point to setPoints object.
	createSetPointBtn.addEventListener("click", function () {
		var prismXY = getXY.prism();
		var spName = 'SP' + num;
		setPoints[spName] = { x: prismXY.x, y: prismXY.y };
		num += 1;	


	});

	// END OF CREATE SET POINT



	//--------------
	// CLEAR ALL SET POINTS
	//--------------

		var clearSetPointsBtn = document.getElementById('clearSetPointsBtn');

		// Button that resets the setPoints object back to empty and resets the SP label numbers also. 
		clearSetPointsBtn.addEventListener("click", function () {
			setPoints = {};
			num = 1;
		})

		// runs in draw function all the time and updates the drawing if setPoints changes. 
		function updateSetpoints() {
			setPoints = setPoints;

		}

	// END OF CLEAR ALL SET POINTS


	//--------------
	// MAIN DRAW FUNCTION
	//--------------

	// This function reruns and redraws the canvas elements every 10 milliseconds. (Refer in initialize function)
	function draw() {
		clearCanvas();
		controlPoints();
		loadImages();
		disDisplay.innerHTML = pretendDistance( distance( getXY["station"](), getXY["prism"]() ) );
		angle();
		drawScale();
		drawNewSetPoints();
		updateSetpoints();
	}

	// END OF DRAW FUNCTION


	//--------------
	// INITIALIZE FUNCTION
	//--------------
	function initialize() {
		// the window is resized.
		resizeCanvas();

		// Add event listener to get out mouse position
		canvas.addEventListener('mousemove', function(evt) { getMousePos(evt); });
		// Block text selection on doubleclick
		canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
		// Register an event listener to resize window
		window.addEventListener('resize', resizeCanvas, false);
		// Listen for clicking out zeroset button
		var zeroSet = document.getElementById("zeroSet");
		zeroSet.addEventListener( 'click', displayZeroSet, true );

		// Add our own mouse events
		canvas.onmousedown = mDown;
		canvas.onmouseup = mUp;

		// Draw canvas border for the first time.
		intervalId = setInterval(draw, 10);
	}

	// draw canvas.
	initialize();

	// END OF INITIALIZE FUNCTION
});

// Show the current active page
// var activePage = $.mobile.activePage[0].id

function degreeToRadians (d){
	var angle = ( d * (Math.PI/180) );
	return angle.toFixed(1);
}

function radianToDegrees(r){
	var angle = ( r * (180/Math.PI) );
	return angle.toFixed(1);
}
