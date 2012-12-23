var PhoneListCtrl	= function ($scope) {
	$scope.phones = [
		{"name": "Nexus S", "snippet": "Fast just got faster with Nexus S."},
		{"name": "Motorola XOOM™ with Wi-Fi", "snippet": "The Next, Next Generation tablet."},
		{"name": "MOTOROLA XOOM™", "snippet": "The Next, Next Generation tablet."}
	];
	new Firebase('https://napsterfm.firebaseio.com/dude').on('value', function (value) { $scope.phones[1].name = value.val(); $scope.$apply(); })
};
