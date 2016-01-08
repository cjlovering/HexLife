(function(){

            

            var color = 0;

            var canvas;

            var ctx, currentHex = new Hexagon();

            var hexHeight,
                hexRadius,
                hexRectangleHeight,
                hexRectangleWidth,
                hexagonAngle = 0.523598776, // 30 degrees in radians
                sideLength,
                boardWidth = 75,
                boardHeight = 75;

            var cells = CreateCellArray();

            var fps = 550;

            window.onload = function(){
                
                canvas = document.getElementById('hexmap');
                canvas.width  = window.innerWidth;
                canvas.height = window.innerHeight;

                if (canvas.getContext){
               
                    configureHexagonParameters();

                    ctx = canvas.getContext('2d');

                    PopulateCellArray();
                    drawBoard(ctx, boardWidth, boardHeight);

                    canvas.addEventListener("mousemove", function(eventInfo) {
                        mouseMoveResponse(eventInfo);
                    });

                    canvas.addEventListener("mouseup", function(eventInfo){
                
                        inject(eventInfo);
                        //currentHex.Draw();
                    });

                    var resizeId;
                    $(window).resize(function(){
                        clearTimeout(resizeId);
                        resizeId = setTimeout(onResizeDraw, 300);
                    });

                    loop();
                }
            }


            function Rules(n, l){
                
                if(l)
                {
                    if (n > 4) return false;
                    else if (n > 1)return true;
                    else return false;
                }
                else if (n > 3) return true;
                
            }



            function Hexagon(x,y) {
                this.x = x;
                this.y = y;
                this.live = false;
                this.next = false;
                this.n = 0;

                this.Play = function(){
                    this.next = Rules(this.Neighbors(), this.live);
                }

                this.Kill = function(){ this.next = false; }

                this.Live = function(){ this.next = true; }

                this.Alive = function(){ return this.live; }

                this.Neighbors = function(){
                   
                    var test, n = 0; 
                

                    if(this.y%2 == 0){

                        test = [[0, -1], [1, -1], [1, 0], [ 0, 1], [ -1, 0], [-1, 1], [-1, -1]]; //[0, 0 ],

                    } else {

                        test = [[0, -1], [1, -1], [1, 0], [ 0, 1], [-1, 0], [ 1, 1] ]; //[0, 0 ], 

                    }

                    
                    for (var i = 0; i < test.length; i++){
                        if ( this.x + test[i][0] >= 0 && this.x + test[i][0] < boardWidth && this.y + test[i][1] >= 0 && this.y + test[i][1] < boardHeight )
                        {      
                            if (cells[ this.x + test[i][0] ][ this.y + test[i][1] ].Alive()) n += 1;
                        }   
                    }

                    this.n = n;
                    return n;
                }

                this.Draw = function(){
                    var screenX = this.x * hexRectangleWidth + ((this.y % 2) * hexRadius);
                    var screenY = this.y * (hexHeight + sideLength);

                    ctx.fillStyle = getColor(this.n);
                    drawHexagon(ctx, screenX, screenY, this.next);         //Rules(this.Neighbors(), this.live)
                    this.live = this.next;
                }
            }

            function CreateCellArray(){
                var arr = [];
                for ( var i = 0; i < boardWidth; i++) arr[i] = []
                return arr;
            }

            function PopulateCellArray(){
                for ( var i = 0; i < boardWidth; i++)
                    for ( var j = 0; j < boardHeight; j++)
                        cells[i][j] = new Hexagon(i,j);
            }


            function loop(){
                setTimeout(function(){
                    
                    for ( var i = 0; i < boardWidth; i++)
                    for ( var j = 0; j < boardHeight; j++)
                        cells[i][j].Play();

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawBoard(ctx, boardWidth, boardHeight);

                    loop();
                }, fps)
            }

            function inject(eventInfo){

                var x,
                    y,
                    xx,
                    yy,
                    test,
                    test2,
                    i;

                x = eventInfo.offsetX || eventInfo.layerX;
                y = eventInfo.offsetY || eventInfo.layerY;
                
                yy = Math.floor(y / (hexHeight + sideLength));
                xx = Math.floor((x - (yy % 2) * hexRadius) / hexRectangleWidth);

                if (yy%2 == 0) {

                    test2 = [[0, -1], [1, -1], [1, 0], [ 0, 1], [ -1, 0], [0, 0 ], [-1, 1], [-1, -1]];

                    test = [[-1, -2], [0, -2], [1, -2], [1, -1], [1, 1], [1, 2], [0, 2], [-1, 2], [-2, 1], [-2, 0], [-2, -1], [2, 0]];

                } else {

                    test2 = [[0, -1], [1, -1], [1, 0], [ 1, 1], [ 0, 1], [0, 0 ], [-1, 0]];

                    test = [[-2, 0], [-1, -1], [-1, -2], [0, -2], [1, -2], [2, -1], [2, 0], [2, 1], [1, 2], [0, 2], [-1, 2], [-1, 1]];
                }

                for (i = 0; i < test2.length; i++){
                    if ( xx + test2[i][0] >= 0 && xx + test2[i][0] < boardWidth && yy + test2[i][1] >= 0 && yy + test2[i][1] < boardHeight )
                    {      
                        cells[ xx + test2[i][0] ][ yy + test2[i][1] ].Kill();
                    }   
                }

                for (i = 0; i < test.length; i++){
                    if ((xx + test[i][0] >= 0 && xx + test[i][0] < boardWidth) && ( yy + test[i][1] >= 0 && yy + test[i][1] < boardHeight))
                        {
                            cells[xx + test[i][0]][yy + test[i][1]].Live();
                        }   
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawBoard(ctx, boardWidth, boardHeight);
            }

            function onResizeDraw(){

                ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = "#000000";
                ctx.lineWidth = 1;

                canvas.width  = window.innerWidth;
                canvas.height = window.innerHeight;
                drawBoard(ctx, boardWidth, boardHeight);
            }

            function mouseMoveResponse(eventInfo){

                var x,
                    y,
                    hexX,
                    hexY,
                    screenX,
                    screenY;

                x = eventInfo.offsetX || eventInfo.layerX;
                y = eventInfo.offsetY || eventInfo.layerY;
                
                hexY = Math.floor(y / (hexHeight + sideLength));
                hexX = Math.floor((x - (hexY % 2) * hexRadius) / hexRectangleWidth);

               if((hexX >= 0 && hexX < boardWidth) && (hexY >= 0 && hexY < boardHeight)) {
                    if(currentHex != cells[hexX][hexY]){
                        currentHex = cells[hexX][hexY];
                        currentHex.Live();
                        currentHex.Draw();
                    }
                }
            } 
            
            function getColor(n){
                var colors    = [ "#ccff66", "#FFD700","#66ccff", "#ff6fcf", "#ff6666"];
                n %= colors.length;
                return colors[n];
            }

            function drawBoard(canvasContext, width, height) {
            
                canvasContext.fillStyle = "#000000";
                canvasContext.strokeStyle = "#CCCCCC";
                canvasContext.lineWidth = 1;

                var i,
                    j;

                for(i = 0; i < width; ++i) {
                    for(j = 0; j < height; ++j) {
                        cells[i][j].Draw();
                    }
                }
            }

            function drawHexagon(canvasContext, x, y, fill) {           

                canvasContext.beginPath();
                canvasContext.moveTo(x + hexRadius, y);
                canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight);
                canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
                canvasContext.lineTo(x + hexRadius, y + hexRectangleHeight);
                canvasContext.lineTo(x, y + sideLength + hexHeight);
                canvasContext.lineTo(x, y + hexHeight);
                canvasContext.closePath();

                if(fill) {
                    canvasContext.fill();
                } else {
                    canvasContext.stroke();
                    ctx.fillStyle = "#fff";//EDITOR = #000
                    canvasContext.fill();
                }
            }

            function configureHexagonParameters(){
                sideLength = canvas.height > canvas.width ? canvas.height / boardHeight : canvas.width / boardWidth ;
                hexHeight = Math.sin(hexagonAngle) * sideLength;
                hexRadius = Math.cos(hexagonAngle) * sideLength;
                hexRectangleHeight = sideLength + 2 * hexHeight;
                hexRectangleWidth = 2 * hexRadius;
            }

        })();