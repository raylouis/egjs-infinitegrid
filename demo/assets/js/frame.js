var lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor';
var imageTemplate = '<div class="item"><img src="../image/${no}.jpg"></div>';
var postTemplate = '<div class="item ${className}"><div class="info"><p class="title">${title}</p><p class="description">${lorem}</p></div></div>';
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
		arr.push(getItem(imageTemplate, {no: (i + no) % 60 + 1, link: link}));
		arr.push(getItem(postTemplate, { no: i + no, title: "egjs item " + (i + no + 1), lorem: lorem }));
	}
	return arr;
}

var ig = new eg.InfiniteGrid(document.querySelector(".container"), {
	direction: "vertical",
});
ig.setLayout(eg.InfiniteGrid.FrameLayout, {
	margin: 0, 
	frame: [
		[1, 2, 3, 4, 5, 6],
		[10, 9, 12, 11 , 14, 13],
	],
	itemSize: 200,
});
var groups = {};
var num = 36;
var parallax = new eg.Parallax(window, {
	container: document.querySelector(".container"),
	direction: "vertical",
	// strength: 0.5,
});

ig.on({
	"prepend": function (e) {
		var groupKeys = ig.getGroupKeys(true);
		var groupKey = (groupKeys[0] || 0) - 1;

		if (!(groupKey in groups)) {
			return;
		}
		ig.prepend(groups[groupKey], groupKey);
	},
	"append": function (e) {
		var groupKeys = ig.getGroupKeys(true);
		var groupKey = (groupKeys[groupKeys.length - 1] || 0) + 1;
		if (!(groupKey in groups)) {
			// allow append
			groups[groupKey] = getItems(groupKey * num, num);
		}
		ig.append(groups[groupKey], groupKey);
	},
	"layoutComplete": function(e) {
		parallax.refresh(e.target, e.scrollPos);
	},
	"change": function(e) {
		parallax.refresh(ig.getItems(), e.scrollPos);
	}
});
groups[0] = getItems(0, num);
ig.append(groups[0], 0);

window.addEventListener("resize", function(e) {
	var items = ig.getItems();

	parallax.resize(items);
	parallax.refresh(items, document.body.scrollTop);
});
