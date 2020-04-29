window.onload = init;

function init() {
	var xhr = new XMLHttpRequest();
	var scoreboardInfo = 'Resources/Texts/ScoreboardInfo.json';
	var scObj;
	var startup = true;
	var cBust = 0;

	//animation stuff
	var pMove = 50; //distance to move for the player names (pixels)
	var pCharMove = 20; //distance to move for the character icons

	var fadeInTime = .3; //(seconds)
	var fadeOutTime = .2;
	var introDelay = .8; //all animations will get this delay when the html loads (use this so it times with your transition)

	//to resize the texts if they are too large
	var p1Wrap = $('#p1Wrapper'); 
	var p2Wrap = $('#p2Wrapper');
	var rdResize = $('#round');
	var p1IntroResize = $('#p1Intro');
	var p2IntroResize = $('#p2Intro');

	//max text sizes (used when resizing back)
	var nameSize = '30px';
	var roundSize = '19px';

	//to avoid the code constantly running the same method over and over
	var p1CharacterPrev, p1SkinPrev, p1ScorePrev, p1ColorPrev, p1wlPrev;
	var p2CharacterPrev, p2SkinPrev, p2ScorePrev, p2ColorPrev, p2wlPrev;
	var bestOfPrev;


	xhr.overrideMimeType('application/json');

	function getInfo() {
		xhr.open('GET', scoreboardInfo + '?v=' + cBust, true);
		xhr.send();
		cBust++;
	}

	getInfo();
	setInterval(function () { getInfo(); }, 500); //update interval

	xhr.onreadystatechange = parseJSON;

	function parseJSON() {
		if (xhr.readyState === 4) {
			scObj = JSON.parse(xhr.responseText);
			scoreboard();
		}
	}
	
	function scoreboard() {
		if (startup) {
			getData();
			startup = false;
		}
		else {
			getData();
		}
	}

	function getData() {
		var p1Name = scObj['p1Name'];
		var p1Team = scObj['p1Team'];
		var p1Score = scObj['p1Score'];
		var p1Color = scObj['p1Color'];
		var p1Character = scObj['p1Character'];
		var p1Skin = scObj['p1Skin'];
		var p1WL = scObj['p1WL'];
		
		var p2Name = scObj['p2Name'];
		var p2Team = scObj['p2Team'];
		var p2Score = scObj['p2Score'];
		var p2Color = scObj['p2Color'];
		var p2Character = scObj['p2Character'];
		var p2Skin = scObj['p2Skin'];
		var p2WL = scObj['p2WL'];

		var round = scObj['round'];
		var bestOf = scObj['bestOf'];


		//first, things that will always happen		

		//change border depending of the Best Of status
		if (bestOfPrev != bestOf) {
			$('#borderP1').attr('src', 'Resources/Overlay/Border ' + bestOf + '.png');
			$('#borderP2').attr('src', 'Resources/Overlay/Border ' + bestOf + '.png');
			//update the score ticks so they fit the bestOf border
			updateScore('#p1Score', p1Score, bestOf, "p1ScoreUp", p1Color, false);
			updateScore('#p2Score', p2Score, bestOf, "p2ScoreUp", p2Color, false);
			bestOfPrev = bestOf;
		}
		//change the player background colors
		if (p1ColorPrev != p1Color) {
			$('#p1Color').attr('src', 'Resources/Overlay/Colors/' + p1Color + '.png');
			p1ColorPrev = p1Color;
		}
		if (p2ColorPrev != p2Color) {
			$('#p2Color').attr('src', 'Resources/Overlay/Colors/' + p2Color + '.png');
			p2ColorPrev = p2Color;
		}
		

		//now, things that will happen only the first time the html loads
		if (startup) {

			//first, we have to start with the cool intro stuff
			var allowIntro = scObj['allowIntro']; //to know if the intro is allowed
			if (allowIntro == "yes") {

				//get the variables only used in the intro
				var tournamentName = scObj['tournamentName'];

				//lets see that intro
				$('#overlayIntro').css('opacity', '1');

				//this vid is just the bars moving (todo: maybe do it through javascript?)
				setTimeout(() => { 
					$('#introVid').attr('src', 'Resources/Webms/Intro.webm');
					document.getElementById('introVid').play();
				}, 0); //if you need it to start later, change that 0 (and also update the introDelay)

				if (p1Score + p2Score == 0) { //if this is the first game, introduce players

					$('#p1Intro').html(p1Name); //update player 1 intro text
					resizeText(p1IntroResize); //resize the text if its too large
					$('#p2Intro').html(p2Name); //p2
					resizeText(p2IntroResize);

					//change the color of the player text shadows
					$('#p1Intro').css('text-shadow', '0px 0px 20px ' + getHexColor(p1Color));
					$('#p2Intro').css('text-shadow', '0px 0px 20px ' + getHexColor(p2Color));

					//player 1 name fade in
					gsap.fromTo("#p1Intro",
						{x: -pMove}, //from
						{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}); //to

					//same for player 2
					gsap.fromTo("#p2Intro",
						{x: pMove},
						{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});

				} else { //if its not the first game, show game count

					if (Number(p1Score) + Number(p2Score) != 4) { //if its not the last game of a bo5

						//just show the game count in the intro
						$('#midTextIntro').html("Game " + (Number(p1Score) + Number(p2Score) + 1));

					} else { //if game 5

						if ((round.toUpperCase() == "True Finals".toUpperCase())) { //if true finals

							$('#midTextIntro').html("True Final Game"); //i mean shit gets serious here
							
						} else {

							$('#midTextIntro').html("Final Game");
							
							//if GF, we dont know if its the last game or not, right?
							if (round.toLocaleUpperCase() == "Grand Finals".toLocaleUpperCase() && !(p1WL == "L" && p2WL == "L")) {
								gsap.to("#superCoolInterrogation", {delay: introDelay+.5, opacity: 1, ease: "power2.out", duration: 1.5});
							}

						}
					}
				}

				$('#roundIntro').html(round); //update round text
				$('#tNameIntro').html(tournamentName); //update tournament name
				
				//round, tournament and VS/GameX text fade in
				gsap.to(".textIntro", {delay: introDelay-.2, opacity: 1, ease: "power2.out", duration: fadeInTime});

				//aaaaand fade out everything
				gsap.to("#overlayIntro", {delay: introDelay+1.6, opacity: 0, ease: "power2.out", duration: fadeInTime+.2});

				//lets delay everything that comes after this so it shows after the intro
				introDelay = 2.6;
			}

			//finally out of the intro, now lets start with player 1 first
			//update player name and team name texts
			updatePlayerName('#p1Wrapper', '#p1Name', '#p1Team', p1Name, p1Team, p1Wrap);
			//sets the starting position for the player text, then fades in and moves the p1 text to the next keyframe
			gsap.fromTo("#p1Wrapper", 
				{x: -pMove}, //from
				{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}); //to

			//set the character image for the player
			updateChar(p1Character, p1Skin, '#p1Character');
			//set starting position for the character icon, then fade-in-move the character icon to the overlay
			gsap.fromTo("#p1Character",
				{x: -pCharMove},
				{delay: introDelay+.25, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
			//save the character/skin so we run the character change code only when this doesnt equal to the next
			p1CharacterPrev = p1Character;
			p1SkinPrev = p1Skin;

			//if its grands, we need to show the [W] and/or the [L] on the players
			updateWL(p1WL, "1");
			gsap.fromTo("#wlP1",
				{y: -pMove}, //set starting position some pixels up (it will be covered by the overlay)
				{delay: introDelay+.5, y: 0, ease: "power2.out", duration: .5}); //move down to its default position
			//save for later so the animation doesn't repeat over and over
			p1wlPrev = p1WL;

			//score check, we updated score earlier so we will just set the prevs
			p1ScorePrev = p1Score;


			//took notes from player 1? well, this is exactly the same!
			updatePlayerName('#p2Wrapper', '#p2Name', '#p2Team', p2Name, p2Team, p2Wrap);
			gsap.fromTo("#p2Wrapper", 
				{x: pMove},
				{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});

			updateChar(p2Character, p2Skin, '#p2Character');
			gsap.fromTo("#p2Character",
				{x: -pCharMove},
				{delay: introDelay+.25, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
			p2CharacterPrev = p2Character;
			p2SkinPrev = p2Skin;

			updateWL(p2WL, "2");
			gsap.fromTo("#wlP2",
				{y: -pMove},
				{delay: introDelay+.5, y: 0, ease: "power2.out", duration: .5});
			p2wlPrev = p2WL;

			p2ScorePrev = p2Score;


			//update the round text
			updateRound("#round", round);
			//fade it in
			gsap.to("#overlayRound", {delay: introDelay, opacity: 1, ease: "power2.out", duration: fadeInTime+.2});


			//check if the team has a logo we can place on the overlay
			updateTeamLogo("#teamLogoP1", p1Team);
			updateTeamLogo("#teamLogoP2", p2Team);
		}

		//now things that will happen constantly
		else {

			//player 1 time!
			if ($('#p1Name').text() != p1Name || $('#p1Team').text() != p1Team) {
				//move and fade out the player 1's text
				fadeOutMove("#p1Wrapper", -pMove, function(){
					//now that nobody is seeing it, quick, change the text's content!
					updatePlayerName('#p1Wrapper', '#p1Name', '#p1Team', p1Name, p1Team, p1Wrap);
					//fade the name back in with a sick movement
					fadeInMove("#p1Wrapper");
				});
			}

			//player 1's character icon change
			if (p1CharacterPrev != p1Character || p1SkinPrev != p1Skin) {
				//fade out the image while also moving it because that always looks cool
				fadeOutMove("#p1Character", -pCharMove, function(){
					//now that nobody can see it, lets change the image!
					var charScale = updateChar(p1Character, p1Skin, '#p1Character'); //will return scale
					//and now, fade in and move back
					fadeInChara("#p1Character", charScale);
				});
				p1CharacterPrev = p1Character;
				p1SkinPrev = p1Skin;
			}

			//the [W] and [L] status for grand finals
			if (p1wlPrev != p1WL) {
				//move it away!
				gsap.to("#wlP1", {y: -pMove, ease: "power1.in", duration: .5, onComplete: pwlMoved});
				function pwlMoved() {
					//change the thing!
					updateWL(p1WL, "1");
					//move it back!
					gsap.to("#wlP1", {delay: .1, y: 0, ease: "power2.out", duration: .5});
				}
				p1wlPrev = p1WL;
			}

			//score check
			if (p1ScorePrev != p1Score) {
				updateScore('#p1Score', p1Score, bestOf, "p1ScoreUp", p1Color, true);
				p1ScorePrev = p1Score;
			}			

			//check if the team has a logo we can place on the overlay
			if ($('#p1Team').text() != p1Team) {
				fadeOut("#teamLogoP1", function(){
					updateTeamLogo("#teamLogoP1", p1Team);
					fadeIn("#teamLogoP1");
				});
			}


			//did you pay attention earlier? Well, this is the same as player 1!
			if($('#p2Name').text() != p2Name || $('#p2Team').text() != p2Team){
				fadeOutMove("#p2Wrapper", -pMove, function(){
					updatePlayerName('#p2Wrapper', '#p2Name', '#p2Team', p2Name, p2Team, p2Wrap);
					fadeInMove("#p2Wrapper");
				});
			}

			if (p2CharacterPrev != p2Character || p2SkinPrev != p2Skin) {
				fadeOutMove("#p2Character", -pCharMove, function(){
					var charScale = updateChar(p2Character, p2Skin, '#p2Character'); //will return scale
					fadeInChara("#p2Character", charScale);
				});
				p2CharacterPrev = p2Character;
				p2SkinPrev = p2Skin;
			}

			if (p2wlPrev != p2WL) {
				gsap.to("#wlP2", {y: -pMove, ease: "power1.in", duration: .5, onComplete: pwlMoved});
				function pwlMoved() {
					updateWL(p2WL, "2");
					gsap.to("#wlP2", {delay: .1, y: 0, ease: "power2.out", duration: .5});
				}
				p2wlPrev = p2WL;
			}

			if (p2ScorePrev != p2Score) {
				updateScore('#p2Score', p2Score, bestOf, "p2ScoreUp", p2Color, true);
				p2ScorePrev = p2Score;
			}

			if ($('#p2Team').text() != p2Team) {
				fadeOut("#teamLogoP2", function(){
					updateTeamLogo("#teamLogoP2", p2Team);
					fadeIn("#teamLogoP2");
				});
			}

			
			//and finally, update the round text
			if ($('#round').text() != round){
				fadeOut("#round", function(){
					updateRound("#round", round);
					fadeIn("#round");
				});
			}
		}
	}


	//score change
	function updateScore(scoreID, pScore, bestOf, scoreUpID, pColor, playAnim) {
		var delay = 0;
		if (playAnim) { //do we want to play the score up animation?
			//depending on the "bestOf" and the color, change the clip
			$("#" + scoreUpID).attr('src', 'Resources/Overlay/Score/ScoreUp ' + bestOf + '/' + pColor + '.webm');
			document.getElementById(scoreUpID).play();
			delay = 200;
		}
		//set timeout to the actual image change so it fits with the animation
		setTimeout(() => {
			//change the image depending on the bestOf status and, of course, the current score
			$(scoreID).attr('src', 'Resources/Overlay/Score/Win Tick ' + bestOf + ' ' + pScore + '.png').on("error",function () {
				$(scoreID).attr('src', 'Resources/Literally Nothing.png') //if the score is 3, nothing is shown
			});
		}, delay);
	}

	//team logo change
	function updateTeamLogo(logoID, pTeam) {
		//search for an image with the team name
		$(logoID).attr('src', 'Resources/TeamLogos/' + pTeam + '.png').on("error",function () {
			$(logoID).attr('src', 'Resources/Literally Nothing.png'); //no image? show nothing
		});
	}

	//player text change
	function updatePlayerName(wrapperID, nameID, teamID, pName, pTeam, pWrap) {
		$(wrapperID).css('font-size', nameSize); //set original text size
		$(nameID).html(pName); //update player name
		$(teamID).html(pTeam); //update player team
		resizeText(pWrap); //resize if it overflows
	}

	//round change
	function updateRound(roundID, round) {
		$(roundID).css('font-size', roundSize); //set original text size
		$(roundID).html(round); //change the actual text
		resizeText(rdResize); //resize it if it overflows
	}

	//fade out
	function fadeOut(itemID, funct) {
		gsap.to(itemID, {opacity: 0, duration: fadeOutTime, onComplete: funct});
	}

	//fade out but with movement
	function fadeOutMove(itemID, move, funct) {
		gsap.to(itemID, {x: move, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: funct});
	}

	//fade in
	function fadeIn(itemID) {
		gsap.to(itemID, {delay: .2, opacity: 1, duration: fadeInTime});
	}

	//fade in but with movement
	function fadeInMove(itemID) {
		gsap.to(itemID, {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
	}

	//fade in but for the character image
	function fadeInChara(itemID, charScale) {
		gsap.fromTo(itemID,
			{scale: charScale}, //set scale keyframe so it doesnt scale while fading back
			{delay: .2, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}
		); 
	}

	//check if winning or losing in a GF, then change image
	function updateWL(pWL, playerNum) {
		if (pWL == "W") {
			$('#wlP' + playerNum).attr('src', 'Resources/Overlay/Winners P' + playerNum + '.png');
		} else if (pWL == "L") {
			$('#wlP' + playerNum).attr('src', 'Resources/Overlay/Losers P' + playerNum + '.png');
		} else {
			$('#wlP' + playerNum).attr('src', 'Resources/Literally Nothing.png');
		}
	}

	//text resize (not fancy i know), keeps making the text smaller until it fits
	function resizeText(text) {
		text.each(function(i, text) {
			while (text.scrollWidth > text.offsetWidth || text.scrollHeight > text.offsetHeight) {
				var newFontSize = (parseFloat($(text).css('font-size').slice(0,-2)) * .95) + 'px';
				$(text).css('font-size', newFontSize);
			};
		});
	}

	//so we can get the exact color used by the game!
	function getHexColor(color) {
		switch (color) {
			case "Red":
				return "#ed1c24";
			case "Blue":
				return "#00b7ef";
			case "Pink":
				return "#ffa3b1";
			case "Green":
				return "#a8e61d";
			case "NetGreen":
				return "#42e564";
			case "Purple":
				return "#846ae9";
			case "Magenta":
				return "#ee1c8f";
			case "Yellow":
				return "#dc8c00";
			case "CPU":
				return "#808080";
			default:
				break;
		}
	}

	//positions database starts here!
	Absa = {
		neutral: [5, 19.4, 4.7],
		LoA: [34, 23, 5.75],
		HD: [6, 17, 4.5]
	};
	Clairen = {
		neutral: [-23, 30, 4.5],
		LoA: [31, 28, 4.8],
		HD: [-23, 31, 4.7]
	};
	Elliana = {
		neutral: [-14, 25, 4],
		LoA: [-19, 22, 3.9],
		HD: [-17, 25, 6]
	};
	Etalus = {
		neutral: [-22, 24, 3.4],
		LoA: [19, 34, 5],
		HD: [-22, 33, 3.2]
	};
	Forsburn = {
		neutral: [-24, 13, 4.5],
		LoA: [7, 23, 5.8],
		HD: [-31, 12, 5]
	};
	Kragg = {
		neutral: [-7, 7, 3.4],
		LoA: [-8, 2, 4],
		HD: [-9, -11, 4.5]
	};
	Maypul = {
		neutral: [-7, 30, 3.5],
		LoA: [25, 29, 5],
		Ragnir: [-24, -3, 3],
		HD: [-22, 18, 4.7]
	};
	Orcane = {
		neutral: [-22, 15, 3],
		LoA: [-14, 20, 3.2],
		HD: [-7, 11, 3]
	};
	OriandSein = { //characters with spaces on their name must have them removed
		neutral: [-4, 8, 2.8],
		HD: [-15, 12, 3.4]
	};
	Ranno = {
		neutral: [13, 22, 5],
		LoA: [25, 39, 4.7],
		HD: [9, 26, 4.5]
	};
	ShovelKnight = {
		neutral: [0, 18, 3.2] //also works for HD
	};
	Sylvanos = {
		neutral: [-27, 7, 3.5],
		LoA: [10, 25.8, 6.3],
		HD: [-21, 16, 4.3]
	};
	Wrastor = {
		neutral: [-12, 28, 4.7],
		LoA: [28, 30, 6],
		HD: [-12, 26, 4.7]
	};
	Zetterburn = {
		neutral: [-7, 4, 4.1],
		LoA: [18, 23, 6.1],
		HD: [-20, 6, 4.7]
	};

	//workshop characters:
	AcidRainbows = {
		neutral: [17, 28, 4.75]
	};
	Archen = {
		neutral: [8, 15, 2.7]
	};
	Astra = {
		neutral: [25, 18, 3.2]
	};
	BirdGuy = {
		neutral: [15, 32, 3]
	};
	Epinel = {
		neutral: [22, 30, 4]
	};
	Falco = {
		neutral: [15, 33, 3.8]
	};
	Fox = {
		neutral: [15, 26, 3.8]
	};
	Guadua = {
		neutral: [-20, 19, 3.5]
	};
	HimeDaisho = {
		neutral: [22, 13, 4.5]
	};
	Kirby = {
		neutral: [12, 16, 2]
	};
	Kris = {
		neutral: [20, 26, 4.2]
	};
	MayuAshikaga = {
		neutral: [3, 22, 5],
		alt: [8, 10, 2.5]
	};
	Mollo = {
		neutral: [-3, 20, 4.4]
	};
	Mycolich = {
		neutral: [-2, 11, 3.8]
	};
	Olympia = {
		neutral: [19, 20, 4.5]
	};
	Otto = {
		neutral: [0, 6, 2.8]
	};
	Pomme = {
		neutral: [30, 21, 3.5]
	};
	R_00 = { //this should have "-" but it would break :(
		neutral: [-8, 20, 3.8]
	};
	Sandbert = {
		neutral: [22, 22, 2.5]
	};
	TrummelandAlto = {
		neutral: [10, 30, 2.5],
		alt: [27, -7, 2.5]
	};
	Valkyrie = {
		neutral: [-5, -15, 3]
	};
	Yoyo = {
		neutral: [14, 22, 3]
	};
	ZettaAshikaga = {
		neutral: [-7, 23, 5.5],
		alt: [-15, 5, 2.7]
	};


	//now the big "change character image" function!
	function updateChar(pCharacter, pSkin, charID) {

		//first, change the image path depending on the character and skin
		$(charID).attr('src', 'Resources/Characters/' + pCharacter + '/' + pSkin + '.png').on("error",function () {
			$(charID).attr('src', 'Resources/Literally Nothing.png') //safety check if the img is not found
		});

		//this is so characters with spaces on their names also work
		var pCharNoSpaces = pCharacter.replace(/ /g, "");
		//             x, y, scale
		var charPos = [0, 0, 1];
		//now, check if the character and skin exist in the database up there
		if (window[pCharNoSpaces]) {
			if (window[pCharNoSpaces][pSkin]) { //if the skin has a specific position
				charPos[0] = window[pCharNoSpaces][pSkin][0];
				charPos[1] = window[pCharNoSpaces][pSkin][1];
				charPos[2] = window[pCharNoSpaces][pSkin][2];
			} else if (pSkin.startsWith("Alt ")) { //for a group of imgs that have a specific position
				charPos[0] = window[pCharNoSpaces].alt[0];
				charPos[1] = window[pCharNoSpaces].alt[1];
				charPos[2] = window[pCharNoSpaces].alt[2];
			} else { //if none of the above, use a default position
				charPos[0] = window[pCharNoSpaces].neutral[0];
				charPos[1] = window[pCharNoSpaces].neutral[1];
				charPos[2] = window[pCharNoSpaces].neutral[2];
			}
		}
		//to position the character
		$(charID).css('object-position', charPos[0] + "px " + charPos[1] + "px");
		$(charID).css('transform', "scale(" + charPos[2] + ")");
		return charPos[2]; //we need this one to set scale keyframe when fading back
	}
}