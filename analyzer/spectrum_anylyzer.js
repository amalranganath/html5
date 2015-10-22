
//**
//@Project : Scripts for HTML5 Spectrum Anaylzer
//@Version : 1.0.1
//@Author : Amal Ranganath
//@Started Date : 21 April 2015
//@Last Updated : 21 October 2015 (12:48 AM in the morning :D)
//

window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

var audioVisual = document.getElementById('audio_visual');

// canvas stuff
var canvas = document.getElementById('c');
var analyze_method = document.getElementById('analyze-method');
var ctx = canvas.getContext('2d');

var bar_height, bar_width = 2, num_bars = canvas.width / bar_width;

// audio stuff
var audio = new Audio();
var audioSrc = 'Tsunami-Bailatronic_remix.mp3';//Martin_Garrix_-_Animals.mp3'Bollywod-mix.mp3; Tsunami (Bailatronic remix)
audio.src = audioSrc;
audio.controls = true;
audio.autoplay = true;
audio.id = 'audio';
audioVisual.appendChild(audio);
//Select a local file
document.getElementById('audio_file').onchange = function () {
    var files = this.files;
    var file = URL.createObjectURL(files[0]);
    audio.src = file ? file : 'Martin_Garrix_-_Animals.mp3';
};

//Drow a circle
var circle = function (c, x, y, r) {
    c.beginPath();
    c.arc(x, y, r, 0, 2 * Math.PI, false);
    c.closePath();
    c.fill();
};
var flash = {
    balls: [],
    hfov: 100 * Math.PI / 180,
    vfov: 80 * Math.PI / 180,
    maxDistanse: 500,
    speed: 3,
    hViewDistance: 0,
    vViewDistance: 0,
    init: function () {
        // Set up the view distance based on the field-of-view (with pythagoras)
        this.hViewDistance = (canvas.width / 2) / Math.tan(this.hfov / 2);
        this.vViewDistance = (canvas.height / 2) / Math.tan(this.vfov / 2);

        for (i = 0; i < num_bars; i++) {
            this.balls[i] = {
                x: (Math.random() * canvas.width) - (canvas.width / 2),
                y: (canvas.height / 2) - (Math.random() * canvas.height),
                z: Math.random() * this.maxDistanse,
                r: 2,
                vx: 2,
                vy: 1,
                color: "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ", 0.8)"
            };
        }
        //console.log(this);
    },
    update: function (data) {
        // Draw ball
        for (var i in this.balls) {
            //ctx.save();
            ctx.restore();
            this.find(i, data);
            ctx.fillStyle = ball.color;
            ctx.beginPath();
            ctx.arc(ball.vx, ball.vy, ball.r, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            //console.log(this.balls[i]);
        }
    },
    find: function (i, data) {
        ball = this.balls[i];
        ball.z -= this.speed;
        if (ball.z <= 0) {
            ball.z = this.maxDistanse;
            ball.x = (Math.random() * canvas.width) - (canvas.width / 2);
        }
        //side = ball.z > (data[i]) ? (ball.z - data[i]) : (ball.z + data[i]/5);//forword
        side = ball.z - data[i];//both forword & backword
        ball.vx = (ball.x * this.hViewDistance) / side;
        ball.vy = (ball.y * this.vViewDistance) / side;
        ball.vx += canvas.width / 2;
        ball.vy = (canvas.height / 2) - ball.vy;
        if (side < 0)
            side = 1;
        ball.r = (1 - (side / this.maxDistanse)) * 3;
    }
};

//Oprate Particles
var particles = {
    PARTICLES: [],
    RADIUS: 20,
    RADIUS_SCALE: 1,
    RADIUS_SCALE_MIN: 1,
    RADIUS_SCALE_MAX: 1.5,
    init: function () {
        for (var i = 0; i < num_bars; i++) {
            this.PARTICLES[i] = {
                position: {x: canvas.width / 2, y: canvas.height / 2},
                shift: {x: canvas.width / 2, y: canvas.height / 2},
                size: 1,
                angle: 0,
                speed: 0.01 + Math.random() * 0.001,
                targetSize: 1,
                fillColor: '#' + (Math.random() * 0x404040 + 0xaaaaaa | 0).toString(16),
                orbit: this.RADIUS * .5 + (canvas.width * .5 * Math.random())
            };
        }
    },
    update: function (data) {
        // Scale downward to the min scale
        this.RADIUS_SCALE -= (this.RADIUS_SCALE - this.RADIUS_SCALE_MIN) * (0.02);
        //RADIUS_SCALE = Math.min(-bar_height*.005, RADIUS_SCALE_MAX); //Math.min(RADIUS_SCALE, RADIUS_SCALE_MAX);

        for (var i in this.PARTICLES) {
            //for (i = 0, len = particles.length; i < len; i++) {
            particle = this.PARTICLES[i];

            var lp = {x: particle.position.x, y: particle.position.y};

            // Offset the angle to keep the spin going
            particle.angle += particle.speed;
            //console.log(particle.angle);

            //Find the scale on certain sound                   
            this.RADIUS_SCALE = Math.min(data[i] * .005, this.RADIUS_SCALE_MAX);

            // Apply position
            particle.position.x = particle.shift.x + Math.cos(i + particle.angle) * (particle.orbit * this.RADIUS_SCALE);
            particle.position.y = particle.shift.y + Math.sin(i + particle.angle) * (particle.orbit * this.RADIUS_SCALE);

            // Limit to screen bounds
            particle.position.x = Math.max(Math.min(particle.position.x, canvas.width), 0);
            particle.position.y = Math.max(Math.min(particle.position.y, canvas.height), 0);

            particle.size += (particle.targetSize - particle.size) * 0.05;

            // If we're at the target size, set a new one. Think of it like a regular day at work.
            if (Math.round(particle.size) == Math.round(particle.targetSize)) {
                particle.targetSize = 1 + Math.random() * 7;
            }

            ctx.beginPath();
            ctx.fillStyle = particle.fillColor;
            ctx.strokeStyle = particle.fillColor;
            ctx.lineWidth = particle.size;
            ctx.moveTo(lp.x, lp.y);
            ctx.lineTo(particle.position.x, particle.position.y);
            ctx.stroke();
            ctx.arc(particle.position.x, particle.position.y, particle.size / 2, 0, Math.PI * 2, true);
            ctx.fill();
        }
    }
};


// analyser stuff
var context = new AudioContext();// webkitAudioContext();
var analyser = context.createAnalyser();
//analyser.fftSize = 2048;

// connect the stuff up to eachother
var source = context.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(context.destination);
freqAnalyser();

flash.init();
particles.init();
// draw the analyser to the canvas
function freqAnalyser() {
    window.requestAnimFrame(freqAnalyser);
    var sum, average, scaled_average;
    var data = new Uint8Array(analyser.frequencyBinCount); //Uint8Array(2048);
    var method = analyze_method.options[analyze_method.selectedIndex].value;
    analyser.getByteFrequencyData(data);
    var first = true;
    // clear canvas
    if (method == 'p' || method == 'stars') {
        // Fade out the particles slowly by drawing a rectangle over the entire canvas
        ctx.fillStyle = method == 'stars' ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        //None fading clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    ctx.fillText('htnl5@amalranganath', canvas.width - 100, canvas.height - 2);

    var bin_size = Math.floor(data.length / num_bars);

    for (var i = 0; i < num_bars; i += 1) {
        sum = 0;
        for (var j = 0; j < bin_size; j += 1) {
            sum += data[(i * bin_size) + j];
        }
        bar_height = -(data[i]);
        average = sum / bin_size;
        scaled_average = (average / 256) * canvas.height;
        //find user selected method
        switch (method) {
            case "stars":
                ctx.globalCompositeOperation = 'source-over';//copy
                if (i == 0)
                    flash.update(data);
                break;

            case "p":
                ctx.globalCompositeOperation = 'source-over';//copy

                if (i == 0)
                    particles.update(data);
                break;

            case "w":
                //drawLand();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = "#fff";
                if (first)
                {
                    ctx.beginPath();
                    ctx.moveTo(i * 2, -bar_height);
                    first = false;
                }
                else
                {
                    ctx.lineTo(i * 2, -bar_height);
                }
                ctx.stroke();
                break;

            case "sp":
                for (var j = 0; j < num_bars; j++) {
                    i += 1;
                    r = ((canvas.width + canvas.height) * 0.5) * (Math.cos((average / 2 + i) * (.05 + ((Math.sin(bar_height * 10 * 0.0002) / Math.PI) * .4))) / Math.PI);
                    //ctx.fillRect(Math.sin(i) * r + (canvas.width / 2), Math.cos(i) * r + (canvas.height / 2), 2, 2);
                    x = Math.sin(i) * r + (canvas.width / 2);
                    y = Math.cos(i) * r + (canvas.height / 2);
                    circle(ctx, x, y, -bar_height / 50);
                }
                //updates[i]['x'] = ctx, Math.sin(i) * r;
                //updates[i]['y'] = Math.cos(i) * r + (canvas.height / 2);
                //updates[i]['r'] = -bar_height / 50;
                break;

            case "f":
                ctx.fillStyle = '#' + (Math.random() * 0x404040 + 0xcccccc | 0).toString(16);
                ;
                ctx.globalCompositeOperation = 'lighter';
                for (var j = 0; j < num_bars; j++) {
                    i += 1;
                    r = ((canvas.width + canvas.height) * 0.5) * (Math.cos((bar_height - i) * (.03 + ((Math.sin(-bar_height * 0.002) / Math.PI) * .2))) / Math.PI);
                    //ctx.fillRect(Math.sin(i) * r + (canvas.width / 2), Math.cos(i) * r + (canvas.height / 2), 2, 2);
                    circle(ctx, Math.sin(i) * r + (canvas.width / 2), Math.cos(i) * r + (canvas.height / 2), -bar_height / 70);
                }
                break;

            case "cc":
                var x = i % 2 == 1 ? -i : i;
                //ctx.fillStyle = '#' + (Math.random() * 0x404040 + 0xcccccc | 0).toString(16);

                ctx.globalCompositeOperation = 'lighter';
                for (var j = 0; j < num_bars; j++) {
                    i += 1;
                    r = ((canvas.width + canvas.height) * 0.5) * (Math.cos((sum + x) * (.03 + ((Math.sin(x * 0.002) / Math.PI) * .2))) / Math.PI);
                    vx = Math.sin(i) * r + (canvas.width / 2);
                    vy = Math.cos(i) * r + (canvas.height / 2);
                    //ctx.fillRect(Math.sin(i) * r + (canvas.width / 2), Math.cos(i) * r + (canvas.height / 2), 2, 2);
                    circle(ctx, vx, vy, -bar_height / 70);
                }

                if (i == num_bars - 1) {
                    circle(ctx, vx, vy, -bar_height / 50);
                }
                break;

            case "bb":
                var x = i % 2 == 1 ? -i : i;
                ctx.fillStyle = '#951cff';
                ctx.shadowColor = '#82f2ff';
                ctx.shadowOffsetX = -bar_height * x / 40;
                ctx.shadowOffsetY = -bar_height / 10;
                ctx.shadowBlur = -bar_height / 60;
                //circle(ctx, canvas.width/2 - x*2, canvas.height/2 - bar_height, scaled_average / 20);
                //circle(ctx, canvas.width / 2 - x * 2, i - bar_height, scaled_average / 20);
                circle(ctx, canvas.width / 2 - x * 2, i - (canvas.height / 3) - bar_height * 2, scaled_average / 40);
                break;

            case "s":
                ctx.fillRect(i * bar_width, canvas.height, bar_width - 1, -scaled_average);
                //ctx.fillRect(i * bar_width, scaled_average, bar_width - 1, -scaled_average);
                break;
            case "r":
                ctx.fillRect(i * bar_width, scaled_average, bar_width - 1, -scaled_average);
                //ctx.fillRect(i * bar_width , scaled_average , bar_width - 1 , scaled_average );
                break;
            case "d":
                //ctx.fillRect(i * bar_width, 0, bar_width - 1, scaled_average );
                ctx.fillRect(i * bar_width, scaled_average, bar_width - 1, -scaled_average);
                ctx.fillRect(i * bar_width, canvas.height, bar_width - 1, -scaled_average);
                break;
            case "dr":
                ctx.fillRect(i * bar_width, canvas.height / 2, bar_width - 1, -bar_height);
                ctx.fillRect(i * bar_width, canvas.height / 2, bar_width - 1, bar_height);
                //ctx.fillRect(i * bar_width, canvas.height / 2, bar_width - 1, scaled_average);
                //ctx.fillRect(i * bar_width, canvas.height / 2, bar_width - 1, -scaled_average);
                break;
            case "l":
                //ctx.fillRect(i * bar_width, canvas.height , bar_width - 1, bar_height );
                ctx.fillRect(i * bar_width, canvas.height + bar_height / 2 - scaled_average / 4, bar_width - 1, bar_height / 5);
                //ctx.fillRect(i * bar_width , canvas.height - scaled_average , bar_width -1 ,  -scaled_average/4);
                break;
            case "lr":
                ctx.fillRect(i * bar_width, average, bar_width - 1, average / 2);
                break;
        }

    }//End for

}