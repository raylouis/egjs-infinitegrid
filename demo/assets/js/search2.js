var template = '<div class="item"><img src="${link}../image/${no}.jpg"><div class="info"><div class="bg"></div><div class="title">${title}</div></div></div>';
var link = window.HOMELINK;
function getItem(template, options) {
	return template.replace(/\$\{([^\}]*)\}/g, function () {
		var replaceTarget = arguments[1];

		return options[replaceTarget];
	});
}
function getItems(no, length) {
	var arr = [];
	for (var i = 0; i < length; ++i) {
		arr.push(getItem(template, { no: Math.abs(i + no) % 60 + 1, title: "egjs post" + (i + no), link: link }));
	}
	return arr;
}

var groups = {};
var container = document.querySelector(".container");
var contents = document.querySelector(".contents");
var ig = new eg.InfiniteGrid(contents, {
	isOverflowScroll: true
});

ig.setLayout(eg.InfiniteGrid.JustifiedLayout, {
	minSize: 100,
	maxSize: 300,
	margin: 10,
});

container.insertAdjacentHTML("beforeend", '<div id="prepend"></div><div id="append"></div>');
var prepend = document.getElementById("prepend");
var append = document.getElementById("append");
var axes = new eg.Axes({
	scroll: {
		range: [0, 0],
		bounce: 100
	}
});
var isTouch = false;
var isLoading = true;

ig.on({
	"change": function (e) {
		if (isLoading) {
			return;
		}
		if (!isTouch) {
			axes.setTo({scroll: e.scrollPos}, 0);
		}
	},
	"layoutComplete": function (e) {
		axes.axis.scroll.range[1] = contents.scrollHeight - contents.clientHeight;
		axes.setTo({ scroll: e.scrollPos }, 0);
		if (isLoading) {
			isLoading = false;
			container.className = container.className.replace(/pull/g, "");
		}
	},
});
groups[0] = getItems(0, 30, true);
ig.append(groups[0], 0);


function requestInsert(isAppend) {
	container.className = container.className + " pull";
	setTimeout(function (e) {
		var groupKeys = ig.getGroupKeys(true);
		var groupKey = isAppend ? (groupKeys[groupKeys.length - 1] || 0) + 1 :
			(groupKeys[0] || 0) - 1;

		groups[groupKey] = getItems(groupKey, 30, isAppend);
		ig[isAppend ? "append" : "prepend"](groups[groupKey], groupKey);
	}, 1000);
}

var startBouncing = false;

axes.on({
	"change": function (e) {
		if (e.holding && isLoading) {
			return;
		}
		var pos = e.pos;
		var scroll = pos.scroll;
		var maxRange = axes.axis.scroll.range[1];

		isTouch = !!e.inputEvent;

		if (!axes.isBounceArea()) {
			append.style.height = "0px";
			prepend.style.height = "0px";
			contents.style.transform = "";
			if (isTouch) {
				contents.scrollTop = scroll;
			}
			return;
		}
		var bounce = (scroll < 0 ? scroll : scroll - maxRange);
		var weight = Math.abs(bounce);
		var isAppend = scroll > 0;
		var element = isAppend ? append : prepend;

		contents.style.transform = "translateY(" + (-bounce) + "px)";
		element.style.height = weight + "px";
		element.innerHTML = (weight > 80 ? "Release to " : "Pull to ") + (isAppend ? "append" : "prepend");
	},
	"release": function(e) {
		if (isLoading || !axes.isBounceArea()) {
			return;
		}
		var scroll = e.depaPos.scroll;
		var maxRange = axes.axis.scroll.range[1];
		var isAppend = scroll > 0;
		var weight = Math.abs(scroll < 0 ? scroll : maxRange - scroll);

		if (weight > 80) {
			isLoading = true;
			(isAppend ? append : prepend).innerHTML = "Loading...";
			requestInsert(isAppend);
		}
	},
	"animationStart": function (e) {
		if (isLoading) {
			e.stop();
			return;
		}
		isTouch = true;

		if (!axes.isBounceArea()) {
			var maxRange = axes.axis.scroll.range[1];

			if (e.destPos.scroll < 0) {
				e.setTo({scroll: 0}, e.duration);
			} else if (e.destPos.scroll > maxRange) {
				e.setTo({scroll: maxRange}, e.duration);
			}
		}
	},
	"animationEnd": function (e) {
		isTouch = false;
	}
});

axes.connect(["", "scroll"], new eg.Axes.PanInput(container, {scale: [0, -1]}));