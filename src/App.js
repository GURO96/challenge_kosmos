import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import axios from 'axios';

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [apiData, setApiData] = useState(null);

  

  useEffect(function () {
    async function logJSONData() {
      setIsLoading(true);

      axios.get("https://jsonplaceholder.typicode.com/photos")
      .then(res=>{
          // // console.log(res.data);
          
          setApiData(res.data);
          setIsLoading(false);
      })
      .catch(err=>{
          // console.log(err)
          setIsLoading(false);
      })
      
      
    }

    logJSONData();
    
  },[]);
  
  // // console.log(apiData)
  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    const FIT = ['contain','cover','fill','none','scale-down',]

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        // color: COLORS[Math.floor(Math.random() * COLORS.length)],
        // backgroundImage: `url('${apiData[Math.floor(Math.random() * apiData.length)]?.url || null}')`,
        objectFit: FIT[Math.floor(Math.random() * FIT.length)],
        updateEnd: true,
        srcData : apiData[Math.floor(Math.random() * apiData.length)]?.url || null
      },
    ]);
  };
  // // console.log(moveableComponents.pop())

  const removeMoveable = () => {
    if(moveableComponents.length > 0){
      moveableComponents.pop()
    } 
    
  }
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    // console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      // console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height : "100vh", width: "100vw" }}>
      {isLoading ? null : (<>
        <button onClick={addMoveable}>Add Moveable1</button>
        <button onClick={removeMoveable}>Remove Last Moveable</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
      </>)}
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  
  objectFit,
  srcData,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    
    objectFit,
    srcData,
    id,
    updateEnd
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  // console.log(parentBounds.width)
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
     let newWidth = e.width;
     let newHeight = e.height;

    //  const positionMaxTop = top + newHeight;
    // const positionMaxLeft = left + newWidth;
    // // console.log(parent.getBoundingClientRect())
    // if (positionMaxTop > parentBounds?.height)
    //   newHeight = parentBounds?.height - top;
    // if (positionMaxLeft > parentBounds?.width)
    //   newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      
      objectFit,
      srcData
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

     const positionMaxTop = top + newHeight;
     const positionMaxLeft = left + newWidth;
    // // console.log(positionMaxLeft)
    // if (positionMaxTop > parentBounds?.height)
    //   newHeight = parentBounds?.height - top;
    // if (positionMaxLeft > parentBounds?.width)
    //   newWidth = parentBounds?.width - left;
    

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top //+ beforeTranslate[0];
    const absoluteLeft = left //+ beforeTranslate[0];
    

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
        objectFit,
        srcData
      },
      true
    );
  };

  return (
    <>
      <img
        src={srcData}
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
          objectFit: objectFit
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        bounds={{
            left: 0,
            top: 0,
            bottom: parentBounds.bottom,
            right: parentBounds.right
        }}
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
            objectFit,
            srcData
          });
          
        }}
        snappable={true}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={true}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
        elementGuidelines={[ref.current]}
      />
    </>
  );
};
