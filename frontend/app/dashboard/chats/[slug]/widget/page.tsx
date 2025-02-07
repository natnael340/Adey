"use client";

import { Button } from "@/components/ui/button";
import {
  Check,
  Headset,
  MessageCircleDashed,
  MessageCircleMore,
  MessageSquare,
  MessageSquareDashed,
  MessageSquareMore,
  MessageSquareText,
  MessagesSquare,
  Palette,
  Plus,
  Mic,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Triangle from "./triangle";
import Draggable, {
  ControlPosition,
  DraggableData,
  DraggableEvent,
} from "react-draggable";

const page = () => {
  const [editWidgetScreenSize, setEditWidgetScreenSize] = useState({
    height: 0,
    width: 0,
  });
  const [chatComponentPosition, setChatComponentPosition] = useState<
    undefined | ControlPosition
  >(undefined);
  const [chatScreenVisible, setChatScreenVisible] = useState(true);

  const updateChatComponentPosition = (
    e: DraggableEvent,
    data: DraggableData
  ): void => {
    setChatComponentPosition({
      x: data.x,
      y: data.y,
    });
  };

  useEffect(() => {
    setEditWidgetScreenSize({
      width: window.innerWidth * (3 / 5),
      height: window.innerHeight,
    });
  }, []);
  return (
    <div className="w-screen grid grid-cols-5 overflow-hidden">
      <div className="h-screen space-y-5 overflow-y-scroll p-5 bg-[#F8F9FC] col-span-2">
        <div className="flex flex-row justify-between items-center">
          <Button
            variant="outline"
            size="icon"
            className="border-destructive rounded-full"
          >
            <X className="text-destructive" />
          </Button>
          <Button size="icon">
            <Check />
          </Button>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-lg">Theme</h3>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#E52D27] to-[#B31217] border-2 border-[#FFD900]"></div>
                <p className="text-gray-500 text-sm">Gradient</p>
                <div className="grid grid-cols-5 w-fit gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#FF6E7F] to-[#BFE9FF]"></div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#314755] to-[#26A0DA]"></div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#E65C00] to-[#F9D423]"></div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#CC2B5E] to-[#753A88]"></div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#1488CC] to-[#2B32B2]"></div>
                </div>
                <p className="text-gray-500 text-sm">Solid</p>
                <div className="grid grid-cols-5 w-fit gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#36151E]"></div>
                  <div className="w-9 h-9 rounded-full bg-[#A5C4D4]"></div>
                  <div className="w-9 h-9 rounded-full bg-[#2892D7]"></div>
                  <div className="w-9 h-9 rounded-full bg-[#FF5E5B]"></div>
                  <div className="w-9 h-9 rounded-full bg-[#DB3069]"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg">Custom</h3>
                <p className="text-gray-500 text-sm">Primary color</p>
                <div className="flex flex-row justify-between items-center">
                  <div className="w-9 h-9 rounded-full bg-[#E52D27]"></div>
                  <Palette />
                </div>
                <p className="text-gray-500 text-sm">Primary color</p>
                <div className="flex flex-row justify-between items-center">
                  <div className="w-9 h-9 rounded-full bg-[#E0DDDC]"></div>
                  <Palette />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-lg">Colors</h3>
                <p className="text-gray-500 text-sm">Primary</p>
                <div className="grid grid-cols-5 w-fit gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#36151E] border-2 border-[#FFD900]"></div>
                  <div className="w-9 h-9 rounded-full bg-[#A5C4D4]"></div>
                  <div className="w-9 h-9 rounded-full bg-[#2892D7]"></div>
                  <div className="w-9 h-9 rounded-full bg-[#FF5E5B]"></div>
                  <div className="w-9 h-9 rounded-full bg-[#DB3069]"></div>
                </div>
                <p className="text-gray-500 text-sm">Secondary</p>
                <div className="grid grid-cols-5 w-fit gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#E0DDDC] border-2 border-[#FFD900]"></div>
                  <div className="w-9 h-9 rounded-full bg-[#A5C4D4]"></div>
                  <div className="w-9 h-9 rounded-full bg-[#2892D7]"></div>
                  <div className="w-9 h-9 rounded-full bg-[#FF5E5B]"></div>
                  <div className="w-9 h-9 rounded-full bg-[#DB3069]"></div>
                </div>
                <h3 className="text-lg">Size</h3>
                <div className="grid grid-cols-5 w-fit gap-2 items-end">
                  <p className="text-2xl text-gray-500">Aa</p>
                  <p className="text-xl text-gray-500">Aa</p>
                  <p className="text-base">Aa</p>
                  <p className="text-sm text-gray-500">Aa</p>
                  <p className="text-xs text-gray-500">Aa</p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg">Font Family</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg aspect-square flex flex-col items-center justify-center gap-y-1 border-2 border-[#EDD447]">
                    <h1 className="text-3xl">Aa</h1>
                    <p className=" text-gray-500">Roboto</p>
                  </div>
                  <div className="rounded-lg aspect-square flex flex-col items-center justify-center gap-y-1 border-2 border-[#D9D9D9]">
                    <h1 className="text-3xl">Aa</h1>
                    <p className=" text-gray-500">Roboto</p>
                  </div>
                  <div className="rounded-lg aspect-square flex flex-col items-center justify-center gap-y-1 border-2 border-[#D9D9D9]">
                    <h1 className="text-3xl">Aa</h1>
                    <p className=" text-gray-500">Roboto</p>
                  </div>
                  <div className="rounded-lg aspect-square flex flex-col items-center justify-center gap-y-1 border-2 border-[#D9D9D9]">
                    <h1 className="text-3xl">Aa</h1>
                    <p className=" text-gray-500">Roboto</p>
                  </div>
                  <div className="rounded-lg aspect-square flex flex-col items-center justify-center gap-y-1 border-2 border-[#D9D9D9]">
                    <h1 className="text-3xl">Aa</h1>
                    <p className=" text-gray-500">Roboto</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Widget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 space-x-3">
              <div className="space-y-2">
                <h3 className="text-lg">Icon</h3>
                <div className="grid grid-cols-5 gap-2">
                  <div className="flex justify-center items-center aspect-square border border-[#EDD447] rounded-lg">
                    <MessageCircleMore />
                  </div>
                  <div className="flex justify-center items-center aspect-square border border-[#D9D9D9] rounded-lg">
                    <MessageSquare />
                  </div>
                  <div className="flex justify-center items-center aspect-square border border-[#D9D9D9] rounded-lg">
                    <MessagesSquare />
                  </div>
                  <div className="flex justify-center items-center aspect-square border border-[#D9D9D9] rounded-lg">
                    <MessageSquareMore />
                  </div>
                  <div className="flex justify-center items-center aspect-square border border-[#D9D9D9] rounded-lg">
                    <MessageSquareText />
                  </div>
                  <div className="flex justify-center items-center aspect-square border border-[#D9D9D9] rounded-lg">
                    <MessageCircleDashed />
                  </div>
                  <div className="flex justify-center items-center aspect-square border border-[#D9D9D9] rounded-lg">
                    <MessageSquareDashed />
                  </div>
                  <div className="flex justify-center items-center aspect-square border border-[#D9D9D9] rounded-lg">
                    <Plus />
                  </div>
                </div>
                <h3 className="text-lg">Icon Color</h3>
                <div className="flex flex-row justify-between items-center">
                  <div className="grid grid-cols-5 w-fit gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#36151E]"></div>
                    <div className="w-9 h-9 rounded-full bg-[#A5C4D4]"></div>
                    <div className="w-9 h-9 rounded-full bg-[#2892D7]"></div>
                  </div>
                  <Palette />
                </div>
                <h3 className="text-lg">Icon Size</h3>
                <div>
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-sm text-gray-400">min</p>
                    <p className="text-sm text-gray-400">max</p>
                  </div>
                  <Slider
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg">Badge Color</h3>
                <div className="flex flex-row justify-between items-center">
                  <div className="grid grid-cols-5 w-fit gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#36151E]"></div>
                    <div className="w-9 h-9 rounded-full bg-[#A5C4D4]"></div>
                    <div className="w-9 h-9 rounded-full bg-[#2892D7]"></div>
                  </div>
                  <Palette />
                </div>
                <h3 className="text-lg">Badge Size</h3>
                <div>
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-sm text-gray-400">min</p>
                    <p className="text-sm text-gray-400">max</p>
                  </div>
                  <Slider
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <h3 className="text-lg">Position</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-500 text-sm">Top</p>
                    <Input type="number" defaultValue={-1} min={-1} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Bottom</p>
                    <Input type="number" defaultValue={10} min={-1} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Left</p>
                    <Input type="number" defaultValue={-1} min={-1} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Right</p>
                    <Input type="number" defaultValue={26.6} min={-1} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Chat Box</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <h3 className="text-lg">Size</h3>
                <div>
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-sm text-gray-400">min</p>
                    <p className="text-sm text-gray-400">max</p>
                  </div>
                  <Slider
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 w-fit gap-2">
                  <div>
                    <p className="text-gray-500 text-sm">width</p>
                    <Input type="number" defaultValue={26.6} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Height</p>
                    <Input type="number" defaultValue={26.6} />
                  </div>
                </div>
                <div className="flex items-center flex-row justify-between">
                  <Label htmlFor="chatbox-border" className="text-lg">
                    Border
                  </Label>
                  <Switch id="chatbox-border" />
                </div>
                <div className="flex items-center flex-row justify-between">
                  <Label htmlFor="chatbox-shadow" className="text-lg">
                    Shadow
                  </Label>
                  <Switch id="chatbox-shadow" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg">Position</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-500 text-sm">Top</p>
                    <Input type="number" defaultValue={-1} min={-1} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Bottom</p>
                    <Input type="number" defaultValue={10} min={-1} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Left</p>
                    <Input type="number" defaultValue={-1} min={-1} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Right</p>
                    <Input type="number" defaultValue={26.6} min={-1} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="bg-white relative col-span-3">
        {/* Chatbox */}
        {editWidgetScreenSize.width && (
          <Draggable
            axis="both"
            handle=".handle"
            defaultPosition={{
              x: editWidgetScreenSize.width - 360,
              y: editWidgetScreenSize.height - 40 - 400 - 56 - 12,
            }}
            grid={[1, 1]}
            scale={1}
            bounds="parent"
            onDrag={updateChatComponentPosition}
            position={chatComponentPosition}
          >
            <div className="flex flex-col items-end w-80 gap-y-3 relative">
              <div
                className={`rounded-lg h-[25rem] w-full bg-white shadow-lg cursor-move ${
                  chatScreenVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Header */}
                <div className="handle h-14 w-full px-3 bg-[#1682CB] rounded-t-lg flex flex-cols justify-start items-center">
                  <div className="flex flex-row items-center gap-x-2">
                    <div>
                      <img
                        src="/Xzh3R6N3.jpg"
                        width={100}
                        height={100}
                        className="rounded-full h-10 w-10"
                        alt="assistant"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3>Julian Marqueze</h3>
                      <p className="text-xs font-light text-white opacity-80">
                        Project Manager
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-[18.5rem] w-full p-3 overflow-y-scroll">
                  <div className="w-full flex items-start">
                    <div className="w-4/5 flex flex-row items-end gap-x-1">
                      <div className="pb-1">
                        <img
                          src="/Xzh3R6N3.jpg"
                          width={100}
                          height={100}
                          className="rounded-full h-6 w-6"
                          alt="assistant"
                        />
                      </div>

                      <div className="bg-[#D3D3D3] rounded-lg flex-1 flex-wrap p-2 relative">
                        <p className="text-sm">
                          Hi, I’m Julian, How can I help you today?
                        </p>

                        <div className="flex flex-row justify-end">
                          <p className="text-xs text-gray-500 font-mono">
                            2:35 PM
                          </p>
                        </div>
                        <div className="absolute -left-[10.87px] -bottom-[0.01rem]">
                          <Triangle />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-12 w-full px-3 rounded-b-lg flex flex-rows justify-between items-center border-t border-[#1682CB]">
                  <p className="text-[#959595]">Type your questions</p>
                  <Mic className="text-[#959595] font-thin" />
                </div>
              </div>
              <button
                className="w-14 h-14 rounded-full relative flex justify-center items-center bg-[#1682CB]"
                onClick={() => setChatScreenVisible(!chatScreenVisible)}
              >
                {chatScreenVisible ? (
                  <X color="#ffffff" />
                ) : (
                  <MessageSquareMore color="#ffffff" />
                )}
              </button>
              <button
                className="fixed -top-8 right-0 bg-gray-400 rounded-md px-4 py-1 text-white"
                onClick={() =>
                  setChatComponentPosition({
                    x: window.innerWidth * (3 / 5) - 360,
                    y: window.innerHeight - 40 - 400 - 56 - 12,
                  })
                }
              >
                Reset
              </button>
            </div>
          </Draggable>
        )}
      </div>
    </div>
  );
};

export default page;
