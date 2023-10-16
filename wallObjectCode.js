let objectData = {
    "expressID": 186,
    "type": [],
    "GlobalId": {
        "type": 1,
        "value": "2idC0G3ezCdhA9WVjWemc$"
    },
    "OwnerHistory": {},
    "Name": {
        "type": 1,
        "value": "Muro b\\X2\\00E1\\X0\\sico:Partici\\X2\\00F3\\X0\\n con capa de yeso:163541"
    },
    "Description": null,
    "ObjectType": {},
    "ObjectPlacement": {},
    "Representation": {},
    "Tag": {},
    "psets": [
        {
            "expressID": 253,
            "type": 1451395588,
            "GlobalId": {
                "type": 1,
                "value": "3LVpPLOTD8Y8ACz1_oabXX"
            },
            "OwnerHistory": {},
            "Name": {
                "type": 1,
                "value": "Pset_ReinforcementBarPitchOfWall"
            },
            "Description": null,
            "HasProperties": [
                {
                    "expressID": 252,
                    "type": 3650150729,
                    "Name": {
                        "type": 1,
                        "value": "Reference"
                    },
                    "Description": null,
                    "NominalValue": {
                        "type": 2,
                        "label": "IFCLABEL",
                        "valueType": 1,
                        "value": "Partici\\X2\\00F3\\X0\\n con capa de yeso"
                    },
                    "Unit": null
                }
            ]
        },
    ],
    "mats": []
}










function undoAndRedo(event){
    if(isCtrlDown){
        spheres = [...new Set(spheres)]
        //console.log("spheresClean", spheres)

        spherePositions = [...new Set(spherePositions)]
        ////console.log("spheresPosClean", spherePositions)

        if(isZDown){
            //console.log("undo")

            lastSphere = spheres.pop()
            scene.remove(lastSphere)

            lastSpherePosition = spherePositions.pop()

            lastSphereOutlinePoints = sphereOutlinePointsWall.pop()

            lastWallMesh = wallMeshes.pop()
            scene.remove(lastWallMesh)

            lastOutline = wallOutlines.pop()
            scene.remove(lastOutline)

            lastSphereCopy = sphereCopies.pop()
            scene.remove(lastSphereCopy)

            lastMovedSphere = movedSpheres.pop()
            scene.remove(lastMovedSphere)

            lastLabelMeasure = labelObjects.pop()
            scene.remove(lastLabelMeasure)
        }

        if(isYDown && isCtrlDown){

            //console.log("redo")

            // spheres = [...new Set(spheres)]
            // //console.log("spheresClean", spheres)
            spheres.push(lastSphere)
            scene.add(lastSphere)

            spherePositions.push(lastSpherePosition)

            sphereOutlinePointsWall.push(lastSphereOutlinePoints)

            wallMeshes.push(lastWallMesh)
            scene.add(lastWallMesh)

            wallOutlines.push(lastOutline)
            scene.add(lastOutline)

            sphereCopies.push(lastSphereCopy)
            scene.add(lastSphereCopy)

            movedSpheres.push(lastMovedSphere)
            scene.add(lastMovedSphere)

            labelObjects.push(lastLabelMeasure)
            scene.add(lastLabelMeasure)

        }

    }

}



function onPointerMove(event){

        const planeMaterial = new MeshBasicMaterial({color: "green"})
        const intersectionPlane = new BoxGeometry(30,0, 20);
        const plane = new Mesh(intersectionPlane, planeMaterial)

        const bounds = canvas.getBoundingClientRect();

        const x1 = event.clientX -bounds.left;
        const x2 = bounds.right -bounds.left;
        mouse.x = (x1/ x2) * 2-1;

        const y1 = event.clientY  - bounds.top;
        const y2 = bounds.bottom - bounds.top;
        mouse.y = - (y1 / y2) * 2 +1;

        raycaster.setFromCamera(mouse, camera);

        const intersection = raycaster.intersectObject(plane);

        const mousePos = intersection[0].point

        const firstPoint = spherePositions[spherePositions.length - 1]
        const secondPoint = mousePos
        labelMeasure(secondPoint, firstPoint)

        if(labelObjects.length > 0){
            const ls = labelObjects.pop()
            ls.visible = false
            scene.add(labelObjects[labelObjects.length - 1]);
            // labelObjects.removeFromParent()
            // labelObjects.element = 0

        }


        // const measureLineMat = new LineBasicMaterial({color: "black", linewidth: 2})
        // const lineGeom = new BufferGeometry().setFromPoints([firstPoint,secondPoint])
        // const measureLine = new Line(lineGeom, measureLineMat)
        // scene.add(measureLine)


    if(isShiftDown){
        if (intersection.length > 0) {
            const intersect = intersection[0];
            ////console.log("intersects onPointerMove: ", intersect.point)
            intersectionPoints.push(intersect.point)


            const lastEntry = spherePositions[spherePositions.length -1]
            const secEntry = spherePositions[spherePositions.length -2]

            const linePoints = [];
            linePoints.push(secEntry, lastEntry)

            const measureLineMat = new LineBasicMaterial({color: "black", linewidth: 2})
            const lineGeom = new BufferGeometry().setFromPoints(linePoints)
            const measureLine = new Line(lineGeom, measureLineMat)
            allLines.push(measureLine)
            scene.add(measureLine)

        }
    }

}

function onPointerDown(event){

    const planeMaterial = new MeshBasicMaterial({color: "green"})
    const intersectionPlane = new BoxGeometry(30,0, 20);
    const plane = new Mesh(intersectionPlane, planeMaterial)

    const bounds = canvas.getBoundingClientRect();

    const x1 = event.clientX -bounds.left;
    const x2 = bounds.right -bounds.left;
    mouse.x = (x1/ x2) * 2-1;

    const y1 = event.clientY  - bounds.top;
    const y2 = bounds.bottom - bounds.top;
    mouse.y = - (y1 / y2) * 2 +1;

    raycaster.setFromCamera(mouse, camera);

    const intersection = raycaster.intersectObject(plane);

    if (intersection.length > 0) {
        const intersect = intersection[0];

        if(isADown){
            if(spherePositions.length === 0 ) {

                firstSphere.position.set(intersect.point.x,intersect.point.y,intersect.point.z )
                scene.add(firstSphere)
                spherePositions.push(firstSphere.position)
                spheres.push(firstSphere)
                //console.log("sphere Positions", spherePositions)

                const measure = allLines[allLines.length - 1]
                scene.add(measure)

                const xValFistPoint = spherePositions[spherePositions.length - 1].x
                const sphereCopy = new Mesh(sphereGeometry, sphereMaterialCopy)
                sphereCopy.position.set(xValFistPoint - wallDepth ,intersect.point.y,intersect.point.z )
                //scene.add(sphereCopy)



                //Creates grids and axes in the scene
                const gridLocal = new GridHelper(5,5);
                scene.add(gridLocal)

                const axesLocal = new AxesHelper();
                axesLocal.material.depthTest = false;
                axesLocal.renderOrder = 1;
                scene.add(axesLocal)

                gridLocal.position.set(spherePositions[0].x, 0, spherePositions[0].z)
                scene.add(gridLocal);

                axesLocal.position.set(spherePositions[0].x, 0, spherePositions[0].z)
                scene.add(axesLocal);



            }
        }
        if(!isADown)

            if( spherePositions.length >= 1){

                const xValFistPoint = spherePositions[spherePositions.length - 1].x
                const zValFistPoint = spherePositions[spherePositions.length - 1].z


                const sphere = new Mesh(sphereGeometry, sphereMaterial)
                const sphereCopy = new Mesh(sphereGeometry, sphereMaterialCopy)
                const movedSphere = new Mesh(sphereGeometry, sphereMaterialCopyEdge)

                scene.add(sphere)
                scene.add(sphereCopy)

                spherePositions.push(sphere.position)
                spheres.push(sphere)

                isShiftDownWall(sphere, sphereCopy, movedSphere, spheres, spherePositions, xValFistPoint, zValFistPoint, intersect);
                isNotShiftDownWall(sphere, sphereCopy, movedSphere, spheres, spherePositions, xValFistPoint, zValFistPoint, intersect);
                document.addEventListener('dblclick', onPointerOver(event, sphere, sphereCopy, movedSphere, spheres, spherePositions, xValFistPoint, zValFistPoint, intersect));
            }
    }


        const firstPoint = spherePositions[spherePositions.length - 1]
        const secondPoint = spherePositions[spherePositions.length - 3]
        labelMeasure(secondPoint, firstPoint)


        const measureLineMat = new LineBasicMaterial({color: "white", linewidth: 2})
        const lineGeom = new BufferGeometry().setFromPoints([firstPoint,secondPoint])
        const measureLine = new Line(lineGeom, measureLineMat)
        scene.add(measureLine)
        // if( spherePositions.length === 1){
        //     //console.log("dfghj", spherePositions)
        //     const firstPoint = spherePositions[0]
        //     const secondPoint = spherePositions[1]
        //     labelMeasure(secondPoint, firstPoint)

        //     const measureLineMat = new LineBasicMaterial({color: "black", linewidth: 2})
        //     const lineGeom = new BufferGeometry().setFromPoints([firstPoint,secondPoint])
        //     const measureLine = new Line(lineGeom, measureLineMat)
        //     scene.add(measureLine)

        // } else if ( !spherePositions.length === 1) {

        // }

}

async function onPointerOver(event, sphere, sphereCopy, movedSphere, spheres, spherePositions, xValFistPoint, zValFistPoint, intersect) {

    const bounds = canvas.getBoundingClientRect();

    const x1 = event.clientX -bounds.left;
    const x2 = bounds.right -bounds.left;
    mouse.x = (x1/ x2) * 2-1;

    const y1 = event.clientY  - bounds.top;
    const y2 = bounds.bottom - bounds.top;
    mouse.y = - (y1 / y2) * 2 +1;

    raycaster.setFromCamera(mouse, camera);

    const intersectionSphere = raycaster.intersectObject(firstSphere);

        if (intersectionSphere.length > 0) {
            const intersectSphere = intersectionSphere[0];
            ////console.log("intersects onPointerMove: ", intersectSphere.object.material.color.r)

            intersectSphere.object.material.color.r = 2.0

            const startPosition = spherePositions[0]
            const firstPosition = spherePositions[1]

            const sphereCopyGen = new Mesh(sphereGeometry, sphereMaterialCopy)
            const movedSphereGen = new Mesh(sphereGeometry, sphereMaterialCopyEdge)

            const lastPosition = spherePositions.pop()

            // spherePositions.push(startPosition)
            // //console.log("start and end ", startPosition, lastPosition)

            //console.log("wallmeshes", wallMeshes)

            if(isXDown && isShiftDown ){
                //console.log("XXXXX", spherePositions)
                const directionValue  = spherePositions[spherePositions.length -2].z - spherePositions[spherePositions.length -4].z
                //console.log('directionZZ', directionValue)

                // verschiebe den letzen Sphere auf die selbe Gerade mit der ersten Sphere
                //lastPosition.z = startPosition.z
                //console.log("directionCollectionX.length ",directionCollectionX.length)
                //console.log("directionCollectionZ.length ",directionCollectionZ.length)
                //remove the geometry of the last drawn wall.
                const beforwallmesh = wallMeshes.pop()
                const lastwallmesh = wallMeshes.pop()
                scene.remove(beforwallmesh)
                scene.remove(lastwallmesh)

                const beforwallLine = wallOutlines.pop()
                const lastwallLine = wallOutlines.pop()
                scene.remove(beforwallLine)
                scene.remove(lastwallLine)

                if(directionValue > 0) {
                    ////console.log(lastPosition.z, startPosition.z )

                    lastLabelMeasure = labelObjects.pop()
                    scene.remove(lastLabelMeasure)

                    lastPosition.z = startPosition.z
                    //console.log("lastPosition", lastPosition.z)
                    //console.log("OutlineListSp",sphereOutlinePointsWall)

                    //remove old lightblue sphereCopy and add a new one in the right position
                    const lastSphereCopy = sphereOutlinePointsWall[sphereOutlinePointsWall.length -1]
                    lastSphereCopy[1].z =  lastPosition.z
                    scene.remove(sphereCopies[sphereCopies.length -2])

                    sphereOutlinePointsWall.pop()
                    // sphereCopy and sphere new wall
                    sphere.position.set(xValFistPoint,intersect.point.y,lastPosition.z )
                    sphereCopy.position.set(xValFistPoint ,intersect.point.y,lastPosition.z + wallDepth)
                    sphereCopies.push(sphereCopy)

                    scene.add(sphere)
                    scene.add(sphereCopy)

                    // // sphereCopy last wall with a new position
                    // sphereCopy.position.set(spherePositions[spherePositions.length - 2].x +wallDepth ,intersect.point.y,lastPosition.z )
                    // scene.add(sphereCopy)

                    // remove last drawn spherePositions
                    spherePositions.pop()
                    spherePositions.pop()
                    spherePositions.pop()

                    spherePositions.push(sphere.position)
                    spheres.push(sphere)

                    movedSphere.position.set(startPosition.x  ,startPosition.y , startPosition.z + wallDepth   )
                    scene.add(movedSphere)
                    movedSpheres.push(movedSphere)

                    labelMeasure(sphere.position, movedSphere.position)
                    scene.add(labelObjects[labelObjects.length - 1])

                    sphereOutlinePointsWall.pop();
                    sphereOutlinePointsWall.push([sphere.position, sphereCopy.position, movedSphere.position, startPosition, sphere.position])



                    const wallShape = new Shape();
                    const wallLength = startPosition.distanceTo(lastPosition)

                    // zeichnet im Bildschrim
                    wallShape.moveTo(0,0);
                    wallShape.lineTo(0,heigthStorey);
                    wallShape.lineTo(wallDepth,heigthStorey);
                    wallShape.lineTo(wallDepth,0);
                    wallShape.lineTo(0,0);

                    const extrudeSettings = {

                        depth: wallLength + wallDepth, //length wall
                        bevelEnable: true,
                        bevelSegments: 1,
                        steps: 1,
                        bevelSize: 0,
                        bevelThickness: 0
                    }


                    const wallGeom = new ExtrudeGeometry(wallShape, extrudeSettings);
                    const wallMesh = new Mesh(wallGeom, wallmaterial);

                    const edges = new EdgesGeometry(wallGeom);
                    const outlines = new LineSegments(edges, black)

                    wallMesh.rotation.y = Math.PI/2;
                    outlines.rotation.y = Math.PI/2;

                    wallMesh.position.set(startPosition.x - wallDepth  , 0, startPosition.z +wallDepth )
                    outlines.position.set(startPosition.x - wallDepth, 0, startPosition.z  +wallDepth )

                    scene.add(wallMesh)
                    scene.add(outlines)

                    wallMeshes.push(wallMesh)
                    wallOutlines.push(outlines)

                    ///////////////////////////////////////////////////////
                    // last drawn wall

                    sphereCopyGen.position.set(spherePositions[spherePositions.length - 2].x +wallDepth ,intersect.point.y,lastPosition.z )
                    scene.add(sphereCopyGen)


                    //remove last drawn spherePositions
                    //spherePositions.pop()
                    //spherePositions.pop()
                    //spherePositions.pop()

                    scene.remove(spheres[spheres.length - 5])
                    // spherePositions.push(sphere.position)
                    // spheres.push(sphere)


                    movedSphereGen.position.set(spherePositions[spherePositions.length -2].x + wallDepth, spherePositions[spherePositions.length -2].y, spherePositions[spherePositions.length -2].z   )
                    scene.add(movedSphereGen)
                    // movedSpheres.push(movedSphereGen)

                    labelMeasure(sphereCopyGen.position, movedSphereGen.position)
                    scene.add(labelObjects[labelObjects.length - 1])


                    const HelperPoint = new Vector3(spherePositions[spherePositions.length -2].x, spherePositions[spherePositions.length -2].y, spherePositions[spherePositions.length -2].z )

                    sphereOutlinePointsWall.push([sphere.position, sphereCopyGen.position, movedSphereGen.position, HelperPoint, sphere.position])

                    //console.log("spheres", spheres)
                    //console.log("spherePositions", spherePositions)


                    const wallShapeOld = new Shape();
                    const wallLengthOld = spherePositions[spherePositions.length - 2].distanceTo(sphereCopyGen.position) + wallDepth


                    // zeichnet im Bildschrim
                    wallShapeOld.moveTo(0,0);
                    wallShapeOld.lineTo(0,heigthStorey);
                    wallShapeOld.lineTo(wallDepth,heigthStorey);
                    wallShapeOld.lineTo(wallDepth,0);
                    wallShapeOld.lineTo(0,0);

                    const extrudeSettingsOld = {

                        depth: wallLengthOld + wallDepth, //length wall
                        bevelEnable: true,
                        bevelSegments: 1,
                        steps: 1,
                        bevelSize: 0,
                        bevelThickness: 0
                    }

                    const wallGeomOld = new ExtrudeGeometry(wallShapeOld, extrudeSettingsOld);
                    const wallMeshOld = new Mesh(wallGeomOld, wallmaterial);

                    const edgesOld = new EdgesGeometry(wallGeomOld);
                    const outlinesOld = new LineSegments(edgesOld, black)

                    wallMeshOld.position.set(spherePositions[spherePositions.length - 2].x , 0, spherePositions[spherePositions.length - 2].z - wallDepth  )
                    outlinesOld.position.set(spherePositions[spherePositions.length - 2].x, 0, spherePositions[spherePositions.length - 2].z - wallDepth )

                    scene.add(wallMeshOld)
                    scene.add(outlinesOld)

                    wallMeshes.push(wallMeshOld)
                    wallOutlines.push(outlinesOld)

                    scene.remove(spheres[spheres.length - 4])

                    // sphereOutlinePointsWall.push([sphere.position, sphereCopy.position, movedSphere.position, startPosition, sphere.position])

                } else {
                    //console.log("Otherwise")

                    lastLabelMeasure = labelObjects.shift()
                    scene.remove(lastLabelMeasure)

                    ////console.log(lastPosition.z, startPosition.z )
                    scene.remove(wallMeshes[0])
                    scene.remove(wallOutlines[0])

                    lastPosition.x = firstPosition.x
                    //console.log("lastPosition", lastPosition.x)
                    //console.log("OutlineListSp",sphereOutlinePointsWall)

                    // Generating new spheres for the wall, which is not drawn.
                    //remove old lightblue sphereCopy and add a new one in the right position
                    const lastSphereCopy = sphereOutlinePointsWall[sphereOutlinePointsWall.length -1]
                    lastSphereCopy[1].x =  lastPosition.x
                    scene.remove(sphereCopies[sphereCopies.length -2])

                    // sphereCopy and sphere new wall
                    sphere.position.set(lastPosition.x,intersect.point.y,zValFistPoint  )
                    sphereCopy.position.set(lastPosition.x - wallDepth,intersect.point.y,zValFistPoint)

                    scene.add(sphere)
                    scene.add(sphereCopy)

                    movedSphere.position.set(firstPosition.x - wallDepth   ,firstPosition.y , firstPosition.z   )
                    scene.add(movedSphere)
                    //movedSpheres.push(movedSphere)

                    sphereOutlinePointsWall.shift();
                    //sphereOutlinePointsWall.shift();
                    //sphereOutlinePointsWall.pop();
                    sphereOutlinePointsWall.splice(3,1)
                    sphereOutlinePointsWall.pop()
                    sphereOutlinePointsWall.unshift([sphere.position, sphereCopy.position, movedSphere.position, firstPosition, sphere.position])

                    labelMeasure(sphereCopy.position, movedSphere.position)
                    scene.add(labelObjects[labelObjects.length - 1])

                    const wallShape = new Shape();
                    const wallLength = firstPosition.distanceTo(lastPosition) + wallDepth

                    // zeichnet im Bildschrim
                    wallShape.moveTo(0,0);
                    wallShape.lineTo(0,heigthStorey);
                    wallShape.lineTo(wallDepth,heigthStorey);
                    wallShape.lineTo(wallDepth,0);
                    wallShape.lineTo(0,0);

                    const extrudeSettings = {

                        depth: wallLength, //length wall
                        bevelEnable: true,
                        bevelSegments: 1,
                        steps: 1,
                        bevelSize: 0,
                        bevelThickness: 0
                    }


                    const wallGeom = new ExtrudeGeometry(wallShape, extrudeSettings);
                    const wallMesh = new Mesh(wallGeom, wallmaterial);

                    const edges = new EdgesGeometry(wallGeom);
                    const outlines = new LineSegments(edges, black)

                    wallMesh.rotation.y = 0
                    outlines.rotation.y = 0

                    wallMesh.position.set(firstPosition.x  - wallDepth , 0, firstPosition.z )
                    outlines.position.set(firstPosition.x  - wallDepth, 0, firstPosition.z  )

                    scene.add(wallMesh)
                    scene.add(outlines)

                    wallMeshes.push(wallMesh)
                    wallOutlines.push(outlines)

                    // ///////////////////////////////////////////////////////
                        //////////////////////////
                    //move the existing spheres from the last drawn wall around

                    // sphereCopy last wall with a new position
                    //sphereCopyGen = sphereCopy
                    sphereCopyGen.position.set(lastPosition.x  ,intersect.point.y, spherePositions[spherePositions.length - 2].z + wallDepth )
                    scene.add(sphereCopyGen)

                    // remove last drawn spherePositions
                    spherePositions.pop()
                    spherePositions.pop()
                    spherePositions.pop()

                    scene.remove(spheres[spheres.length - 3])
                    spherePositions.push(sphere.position)
                    spheres.push(sphere)

                    movedSphereGen.position.set(spherePositions[spherePositions.length -2].x, spherePositions[spherePositions.length -2].y, spherePositions[spherePositions.length -2].z + wallDepth  )
                    scene.add(movedSphereGen)

                    const HelperPoint = new Vector3 (spherePositions[spherePositions.length -2].x, spherePositions[spherePositions.length -2].y, spherePositions[spherePositions.length -2].z )

                    sphereOutlinePointsWall.unshift([sphere.position, sphereCopyGen.position, movedSphereGen.position, HelperPoint, sphere.position])

                    //console.log("spheres", spheres)
                    //console.log("spherePositions", spherePositions)

                    scene.remove(labelObjects[labelObjects.length - 2])
                    labelMeasure(sphereCopyGen.position, movedSphereGen.position)
                    scene.add(labelObjects[labelObjects.length - 1])

                    // last drawn wall
                    const wallShapeOld = new Shape();
                    const wallLengthOld = movedSphereGen.position.distanceTo(sphereCopy.position)
                    //movedSpheres.push(movedSphereGen)


                    // zeichnet im Bildschrim
                    wallShapeOld.moveTo(0,0);
                    wallShapeOld.lineTo(0,heigthStorey);
                    wallShapeOld.lineTo(wallDepth,heigthStorey);
                    wallShapeOld.lineTo(wallDepth,0);
                    wallShapeOld.lineTo(0,0);

                    const extrudeSettingsOld = {

                        depth: wallLengthOld, //length wall
                        bevelEnable: true,
                        bevelSegments: 1,
                        steps: 1,
                        bevelSize: 0,
                        bevelThickness: 0
                    }

                    const wallGeomOld = new ExtrudeGeometry(wallShapeOld, extrudeSettingsOld);
                    const wallMeshOld = new Mesh(wallGeomOld, wallmaterial);

                    const edgesOld = new EdgesGeometry(wallGeomOld);
                    const outlinesOld = new LineSegments(edgesOld, black)

                    wallMeshOld.rotation.y = 3* Math.PI/2;
                    outlinesOld.rotation.y = 3* Math.PI/2;

                    wallMeshOld.position.set(spherePositions[spherePositions.length - 2].x + wallDepth , 0, spherePositions[spherePositions.length - 2].z   )
                    outlinesOld.position.set(spherePositions[spherePositions.length - 2].x + wallDepth, 0, spherePositions[spherePositions.length - 2].z  )

                    scene.add(wallMeshOld)
                    scene.add(outlinesOld)

                    wallMeshes.push(wallMeshOld)
                    wallOutlines.push(outlinesOld)

                    // scene.remove(spheres[spheres.length - 4])

                }
                document.removeEventListener( 'pointermove', onPointerMove );
                document.removeEventListener( 'dblclick', onPointerDown );
                document.removeEventListener( 'keydown', undoAndRedo );
                document.removeEventListener( 'keydown', onDocumentKeyDown );
                document.removeEventListener( 'keyup', onDocumentKeyUp );
        }


            const measureLineMat = new LineBasicMaterial({color: "black", linewidth: 2})
            const lineGeom = new BufferGeometry().setFromPoints([lastPosition,startPosition])
            const measureLine = new Line(lineGeom, measureLineMat)

            scene.add(measureLine)
            labelMeasure(startPosition, lastPosition)

            await editWallsFromFile()

        }

}

function isShiftDownWall(sphere, sphereCopy, movedSphere, spheres, spherePositions, xValFistPoint, zValFistPoint, intersect){

    if(isShiftDown){

        sphere.position.set(xValFistPoint,intersect.point.y,intersect.point.z )
        sphereCopy.position.set(xValFistPoint - wallDepth ,intersect.point.y,intersect.point.z )

        scene.add(sphere)
        scene.add(sphereCopy)
        // //console.log('normalize', sphere.position, sphere.position.normalize())
        spherePositions.push(sphere.position)
        spheres.push(sphere)

        const directionValue = spherePositions[spherePositions.length -1].z - spherePositions[spherePositions.length -3].z
        //console.log('direction', directionValue)
        directionCollectionZ.push(directionValue)

        if (directionValue > 0 ) {
            // wenn direction positiv ist, zeigt die Line nach unten

            if (directionCollectionX[directionCollectionX.length -1] > 0) {
                // letzte Wand x-Achse schaut nach rechts
                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(xValFistPoint + wallDepth ,intersect.point.y,intersect.point.z  )
                const movedSpherePosition = new Vector3(sphereHelperPos.x + wallDepth  ,sphereHelperPos.y ,sphereHelperPos.z - wallDepth )
                const rotationAngle = 0;

                const NewHelperPos = new Vector3(sphereHelperPos.x , sphereHelperPos.y, sphereHelperPos.z- wallDepth )

                drawWall(sphereCopy, sphere, movedSphere, NewHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)

            }
            if (directionCollectionX[directionCollectionX.length -1] < 0) {
                // letzte Wand x-Achse schaut nach links
                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(xValFistPoint + wallDepth ,intersect.point.y,intersect.point.z  )
                const movedSpherePosition = new Vector3(sphereHelperPos.x + wallDepth  ,sphereHelperPos.y ,sphereHelperPos.z - wallDepth)
                const rotationAngle = 0;

                drawWall(sphereCopy, sphere, movedSphere, sphereHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)

            }
            if (directionCollectionX[directionCollectionX.length -1] === undefined) {
                // letzte Wand x-Achse schaut nach links
                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(xValFistPoint + wallDepth ,intersect.point.y,intersect.point.z  )
                const movedSpherePosition = new Vector3(sphereHelperPos.x + wallDepth  ,sphereHelperPos.y ,sphereHelperPos.z - wallDepth)
                const rotationAngle = 0;

                drawWall(sphereCopy, sphere, movedSphere, sphereHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)

            }



        }else{
            // ist sie negativ, zeigt sie nach oben.
            if (directionCollectionX[directionCollectionX.length -1] > 0) {

                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(xValFistPoint - wallDepth ,intersect.point.y,intersect.point.z  )
                const movedSpherePosition = new Vector3(sphereHelperPos.x - wallDepth  ,sphereHelperPos.y ,sphereHelperPos.z)
                const rotationAngle = Math.PI;
                const NewHelperPos = new Vector3(spheres[spheres.length - 3].position.x , spheres[spheres.length - 3].position.y, spheres[spheres.length - 3].position.z - wallDepth)

                drawWall(sphereCopy, sphere, movedSphere, NewHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)
            }
            if (directionCollectionX[directionCollectionX.length -1] < 0) {

                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(xValFistPoint - wallDepth ,intersect.point.y,intersect.point.z  )
                const movedSpherePosition = new Vector3(sphereHelperPos.x - wallDepth  ,sphereHelperPos.y ,sphereHelperPos.z + wallDepth )
                const rotationAngle = Math.PI;
                const NewHelperPos = new Vector3(sphereHelperPos.x, sphereHelperPos.y, sphereHelperPos.z + wallDepth)

                drawWall(sphereCopy, sphere, movedSphere, NewHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)
            }
            if (directionCollectionX[directionCollectionX.length -1] === undefined) {

                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(xValFistPoint - wallDepth ,intersect.point.y,intersect.point.z  )
                const movedSpherePosition = new Vector3(sphereHelperPos.x - wallDepth  ,sphereHelperPos.y ,sphereHelperPos.z)
                const rotationAngle = Math.PI;


                drawWall(sphereCopy, sphere, movedSphere, sphereHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)
            }
        }
    }

}

function isNotShiftDownWall(sphere, sphereCopy, movedSphere, spheres, spherePositions, xValFistPoint, zValFistPoint, intersect){

    if (!isShiftDown){
        sphere.position.set(intersect.point.x,intersect.point.y,zValFistPoint )
        sphereCopy.position.set(intersect.point.x ,intersect.point.y,zValFistPoint - wallDepth)

        scene.add(sphere)
        scene.add(sphereCopy)

        spherePositions.push(sphere.position)
        spheres.push(sphere)

        const directionValue = spherePositions[spherePositions.length -1].x - spherePositions[spherePositions.length -3].x
        //console.log('directionX', directionValue)
        directionCollectionX.push(directionValue)

        if (directionValue > 0 ) {
            // wenn direction positiv ist, zeigt die Line nach rechts
            if (directionCollectionZ[directionCollectionZ.length -1] < 0) {
                // letzte Wand z-Achse schaut nach oben
                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(intersect.point.x ,intersect.point.y,zValFistPoint - wallDepth)
                const movedSpherePosition = new Vector3(sphereHelperPos.x - wallDepth ,sphereHelperPos.y ,sphereHelperPos.z - wallDepth)
                const rotationAngle = Math.PI/2;
                const NewHelperPos = new Vector3(sphereHelperPos.x - wallDepth, sphereHelperPos.y, sphereHelperPos.z )

                drawWall(sphereCopy, sphere, movedSphere, NewHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)

            }

            if (directionCollectionZ[directionCollectionZ.length -1] > 0) {
                // letzte Wand z-Achse schaut nach oben
                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(intersect.point.x ,intersect.point.y,zValFistPoint - wallDepth)
                const movedSpherePosition = new Vector3(sphereHelperPos.x  ,sphereHelperPos.y ,sphereHelperPos.z - wallDepth)
                const rotationAngle = Math.PI/2;
                const NewHelperPos = new Vector3(sphereHelperPos.x , sphereHelperPos.y, sphereHelperPos.z )

                drawWall(sphereCopy, sphere, movedSphere, NewHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)

            }


        } else {
            // wenn direction negativ ist, zeigt die Line nach links
            if (directionCollectionZ[directionCollectionZ.length -1] < 0) {
                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(intersect.point.x ,intersect.point.y,zValFistPoint + wallDepth)
                const movedSpherePosition = new Vector3(sphereHelperPos.x  ,sphereHelperPos.y ,sphereHelperPos.z + wallDepth)
                const rotationAngle = 3*Math.PI/2;

                drawWall(sphereCopy, sphere, movedSphere, sphereHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)
            }

            if (directionCollectionZ[directionCollectionZ.length -1] > 0) {
                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(intersect.point.x  ,intersect.point.y,zValFistPoint + wallDepth)
                const movedSpherePosition = new Vector3(sphereHelperPos.x + wallDepth  ,sphereHelperPos.y ,sphereHelperPos.z + wallDepth)
                const rotationAngle = 3*Math.PI/2;
                const NewHelperPos = new Vector3(sphereHelperPos.x + wallDepth, sphereHelperPos.y, sphereHelperPos.z)

                drawWall(sphereCopy, sphere, movedSphere, NewHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)
            }

        }

    }

}


function onDocumentKeyDown(event) {
    switch(event.keyCode){
        case 16: isShiftDown = true;
        break;

        case 88: isXDown = true;
        break;

        case 65: isADown = true;
        break;

        case 17: isCtrlDown = true;
        break;

        case 90: isZDown = true;
        break;

        case 89: isYDown = true;
        break;



    }
}

function onDocumentKeyUp(event) {
    switch(event.keyCode){
        case 16: isShiftDown = false;
        break;

        case 88: isXDown = false;
        break;

        case 65: isADown = false;
        break;

        case 17: isCtrlDown = false;
        break;

        case 90: isZDown = false;
        break;

        case 89: isYDown = false;
        break;


    }

}



// Gumball
function enableGumball(items, tfcontrols) {
    if (items.length > 0 ) {
        const object = items[0].object;
        if (object != tfcontrols.object) {
            tfcontrols.attach(object);
            scene.add(tfcontrols)

        }
    }
};




const previousSelection = {
    mesh: null,
    material: null,
};




function isPreviousSelection(item) {
    return previousSelection.mesh === item.object;
}
function saveNewSelection(item) {
    ////console.log("found", item)
    previousSelection.mesh = item.object;
    previousSelection.material = item.object.material;
    positionToilet = item.object.position
    //toiletPositions.push(positionToilet)
    ////console.log(positionToilet)
}

function restorePreviousSelection() {
    if(previousSelection.mesh) {
        // if there is no collision, return the original color of the sphere
        previousSelection.mesh.material = previousSelection.material;
        //reset
        previousSelection.mesh = null;
        previousSelection.material = null;
    }
}




function labelMeasure(firstPt, secondPt){
    const distances = firstPt.distanceTo(secondPt)
    const distancePositive = Math.abs(distances)
    const message = distancePositive.toFixed(2)

    const middelPointsX = ( firstPt.x + secondPt.x) * 0.5;
    const middelPointsY = ( firstPt.y + secondPt.y) * 0.5;
    const middelPointsZ = ( firstPt.z + secondPt.z) * 0.5;

    const middelPoint = new Vector3(middelPointsX, middelPointsY, middelPointsZ)

    const labelBase = document.createElement('div');
    labelBase.className = 'label-container'

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.className = 'delete-button hidden';
    labelBase.appendChild(deleteButton)



    const label = document.createElement('p');
    label.classList.add('label-style');
    labelBase.appendChild(label);

    label.textContent = message;
    const labelObject = new CSS2DObject(labelBase);

    labelObjects.push(labelObject)

    // scene.add(labelObjects[1]);


    deleteButton.onclick = () => {
        labelObject.removeFromParent();
        labelObject.element = null;
        labelBase.remove();
    }

    labelBase.onmouseenter = () => {
        deleteButton.classList.remove('hidden')
    }
    labelBase.onmouseleave = () => {
        deleteButton.classList.add('hidden')
    }
}


function drawWall(sphereCopy, sphere, movedSphere, sphereHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle) {
    // ist sie negativ, zeigt sie nach links
    scene.remove(sphereCopy)
    sphereCopy.position.set(sphereCopyPosition.x,sphereCopyPosition.y, sphereCopyPosition.z );
    scene.add(sphereCopy)
    sphereCopies.push(sphereCopy)

    movedSphere.position.set( movedSpherePosition.x, movedSpherePosition.y, movedSpherePosition.z)
    scene.add(movedSphere)
    movedSpheres.push(movedSphere)

    sphereOutlinePointsWall.push([sphere.position, sphereCopy.position, movedSphere.position, sphereHelperPos, sphere.position])

    const wallShape = new Shape();
    const wallLength = sphere.position.distanceTo(movedSphere.position)

    // zeichnet im Bildschrim
    wallShape.moveTo(0,0);
    wallShape.lineTo(0,heigthStorey);
    wallShape.lineTo(wallDepth,heigthStorey);
    wallShape.lineTo(wallDepth,0);
    wallShape.lineTo(0,0);

    const extrudeSettings = {

        depth: wallLength, //length wall
        bevelEnable: true,
        bevelSegments: 1,
        steps: 1,
        bevelSize: 0,
        bevelThickness: 0
    }

    const wallGeom = new ExtrudeGeometry(wallShape, extrudeSettings);
    const wallMesh = new Mesh(wallGeom, wallmaterial)

    const edges = new EdgesGeometry(wallGeom);
    const outlines = new LineSegments(edges, black)

    wallMesh.rotation.y = rotationAngle;
    outlines.rotation.y = rotationAngle;

    wallMesh.position.set(sphereHelperPos.x , 0, sphereHelperPos.z )
    outlines.position.set(sphereHelperPos.x , 0, sphereHelperPos.z )

    wallMeshes.push(wallMesh)
    wallOutlines.push(outlines)

    scene.add(wallMesh)
    scene.add(outlines)

}






async function editWallsFromFile(){
    const WallsIDs =  await loader.ifcManager.getAllItemsOfType(0, IFCWALLSTANDARDCASE, false);
    for (let ids = 0; ids < WallsIDs.length; ids++) {
        //console.log(WallsIDs[ids])
        var id = WallsIDs[ids]

        const wall = await loader.ifcManager.getItemProperties( 0, id);
        //console.log("wall: ",wall);

        const productDefShape = wall.Representation.value
        const ProductDefShape =  await loader.ifcManager.getItemProperties(0, productDefShape );
        //console.log("Product Def Shape: ",ProductDefShape)

        const representationCurve = ProductDefShape.Representations
        //const RelPlace =  await loader.ifcManager.getItemProperties(0, relplacement );
        //console.log("Representations Curve2D",representationCurve[0])

        const curve = await loader.ifcManager.getItemProperties(0, representationCurve[0].value );
        // //console.log("Shape Repr",curve.Items[0].value)
        const curveItems = curve.Items[0].value
        ////console.log("Items", items)

        const representationSolid = ProductDefShape.Representations
        //const RelPlace =  await loader.ifcManager.getItemProperties(0, relplacement );
        //console.log("Representations solid",representationSolid[1])

        const solid = await loader.ifcManager.getItemProperties(0, representationSolid[1].value );
        // //console.log("Shape Repr",curve.Items[0].value)
        const SolidItems = solid.Items[0].value
        const Solids = await loader.ifcManager.getItemProperties(0, SolidItems);
        //console.log("Itemssolid", Solids)

        const areaSwept = Solids.SweptArea
        const sweptArea = await loader.ifcManager.getItemProperties(0, areaSwept.value);
        //console.log("sweptArea", sweptArea)

        const outerCrv = sweptArea.OuterCurve
        const Outercrv = await loader.ifcManager.getItemProperties(0, outerCrv.value);
        //console.log("OuterCrv", Outercrv.Points)

        // //console.log("spherpso ", spherePositions)
        //console.log("OuterPoints Spheres",sphereOutlinePointsWall)

        // Outline Curves von allen ifcWalls
        OutercrvList.push(Outercrv.Points)
        //console.log("outerList", OutercrvList)
    }
    await settingPoints(OutercrvList, 0)
    await settingPoints(OutercrvList, 1)
    await settingPoints(OutercrvList, 2)
    await settingPoints(OutercrvList, 3)
    await settingPoints(OutercrvList, 4)

    data = await loader.ifcManager.ifcAPI.ExportFileAsIFC(0);
    blob = new Blob([data]);
    const file = new File([blob], "./create.ifc");


    const downloadbutton = document.getElementById('download-button')
    const link = document.createElement('a');
    link.download = './create.ifc';
    link.href = URL.createObjectURL(file);


    downloadbutton.appendChild(link);

    const downloadFile = () => {
        //console.log("downloaded")
        link.click();
        link.remove();};
    downloadbutton.addEventListener('click', downloadFile);

}

async function settingPoints(OutercrvList, pointNumber){
    parseInt(pointNumber)
    for(let values = 0; values < OutercrvList.length; values++) {
        //console.log("forloop Outercurves", OutercrvList[values][pointNumber])

        // all zero Values
        const Polypoints = OutercrvList[values][pointNumber].value
        //console.log(Polypoints) // id
        const pts = await loader.ifcManager.getItemProperties(0, Polypoints);
        //console.log("pts", pts.Coordinates)

        pts.Coordinates[0].value = sphereOutlinePointsWall[values][pointNumber].x
        pts.Coordinates[1].value = sphereOutlinePointsWall[values][pointNumber].z

        await loader.ifcManager.ifcAPI.WriteLine(0, pts);
    }
}
