var THREE = THREE || {};

THREE.Interaction = function (camera, element) {
    var mouseX = 0, mouseY = 0,
        xMousePos = 0,
        yMousePos = 0,
        xMouseMove = 0,
        yMouseMove = 0,
        xMouseStartPos = 0,
        yMouseStartPos = 0,
        dragStart = false,
        mouseXOnMouseDown = 0,

        windowHalfX = window.innerWidth / 2,
        windowHalfY = window.innerHeight / 2,
        dragging = false, mouseButtonLeft = false;

    var camera = camera;
    this.element = element || document;

    // Add mouse listeners for element
    this.element.addEventListener('touchstart', onTouchStart, false);
    this.element.addEventListener('touchmove', onTouchMove, false);
    this.element.addEventListener('touchend', onTouchEnd, false);

    this.element.addEventListener('mousedown', onMouseDown, false);
    this.element.addEventListener('mousemove', onMouseMove, false);
    this.element.addEventListener('mouseup', onMouseUp, false);
    this.element.addEventListener('mousewheel', onMouseWheel, false);
    this.element.addEventListener('DOMMouseScroll', onMouseWheel, false);

    function onTouchStart(event) {
        if (event.touches.length == 1) {
            event.preventDefault();
            mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
            mouseButtonLeft = true;
            dragStart = true;
        }
    }

    function onTouchMove(event) {
        if (event.touches.length == 1) {
            event.preventDefault();
            var clientX = event.touches[ 0 ].pageX - windowHalfX;
            var clientY = event.touches[ 0 ].pageY - windowHalfY;
            // targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

            dragging = true;

            if (dragStart) {

                xMousePos = clientX;
                yMousePos = clientY;
                xMouseMove = 0;
                yMouseMove = 0;
                xMouseStartPos = clientX;
                yMouseStartPos = clientY;
                dragStart = false;
            }

            if (dragging) {
                xMousePos = clientX;
                yMousePos = clientY;

                xMouseMove = (xMousePos - xMouseStartPos);
                yMouseMove = (yMousePos - yMouseStartPos);

                xMouseStartPos = xMousePos;
                yMouseStartPos = yMousePos;
            }
        }
    }

    function onTouchEnd(event) {
        event.preventDefault();

        mouseButtonLeft = false;
        // dragging = false;
    }


    function onMouseDown(event) {
        event.preventDefault();
        if (event.button == 2) {
            xMouseMove = 40;
        }

        if (event.button == 0) {
            mouseButtonLeft = true;
            dragStart = true;
        }
    }

    function onMouseMove(event) {
        event.preventDefault();

        if (mouseButtonLeft) {
            dragging = true;
        }

        if (dragStart) {

            xMousePos = event.clientX;
            yMousePos = event.clientY;
            xMouseMove = 0;
            yMouseMove = 0;
            xMouseStartPos = event.clientX;
            yMouseStartPos = event.clientY;
            dragStart = false;
        }

        if (dragging && mouseButtonLeft) {
            xMousePos = event.clientX;
            yMousePos = event.clientY;

            xMouseMove = (xMousePos - xMouseStartPos);
            yMouseMove = (yMousePos - yMouseStartPos);

            xMouseStartPos = xMousePos;
            yMouseStartPos = yMousePos;
        }
    }

    function onMouseUp(event) {
        event.preventDefault();

        if (event.button == 0) {
            mouseButtonLeft = false;
            // dragging = false;
        }
    }

    function onMouseWheel(event) {
        event.preventDefault();

        var delta = 0;
        // normalize the delta
        if (event.wheelDelta) {
            delta = event.wheelDelta / 120; // IE & Opera
        } else if (event.detail) { // W3C
            delta = -event.detail / 3;
        }

        if (event.shiftKey) {
            camera.rotation.x += delta * 0.2;
        } else {
            camera.position.z -= delta * 1000;
        }
    }

    function zoom(delta) {
        distanceTarget -= delta;
        distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
        distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
    }

    this.update = function () {
        var dist = camera.position.z / 1000;
        camera.position.x -= (xMouseMove * 2) * (dist);
        camera.position.y += (yMouseMove * 2) * (dist);

        if (xMouseMove > -0.5 && xMouseMove < 0.5)
            xMouseMove = 0;
        if (yMouseMove > -0.5 && yMouseMove < 0.5)
            yMouseMove = 0;

        xMouseMove *= 0.9;
        yMouseMove *= 0.9;
    };
};
