export default class CircularQueue {
    maxSize: number;
    frontIndex: number;
    rearIndex: number;
    queueArray: any;
    length: number;

  constructor(size:number) {
    this.maxSize = size;
    this.frontIndex = -1;
    this.rearIndex = -1;
    this.queueArray = {};
    this.length = 0;
  }

  //Add at the rear (dequeue if full), Time O(1), Space O(1)
  enqueue(value:any) {
    if (this.isFull()) {
      this.dequeue();
    }
    if (this.frontIndex == -1) this.frontIndex = 0;
    this.rearIndex = (this.rearIndex + 1) % this.maxSize;
    this.queueArray[this.rearIndex] = value;
    this.length++;
  }

  //Remove from the front, Time O(1), Space O(1)
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    var item = this.queueArray[this.frontIndex];
    if (this.frontIndex == this.rearIndex) {
      //one element left
      this.frontIndex = -1;
      this.rearIndex = -1;
    } else {
      this.frontIndex = (this.frontIndex + 1) % this.maxSize;
    }
    this.length--;
    return item;
  }

  //Print all, Time O(n), Space O(1), n is number of items in queue
  print() {
    if (this.isEmpty()) {
      console.log("Queue is empty");
      return;
    }
    var str = "Queue: ";
    var i;
    for (i = this.frontIndex; i != this.rearIndex; i = (i + 1) % this.maxSize)
      str += this.queueArray[i] + " ";
    str += this.queueArray[i];
    console.log(str);
  }

  //Find item, Time O(n), Space O(1), n is number of items in queue
  find(value:any, key:any) {
    if (this.isEmpty()) {
      return null;
    }
    for (
      let i = this.frontIndex;
      i != this.rearIndex;
      i = (i + 1) % this.maxSize
    ) {
      if (this.queueArray[i][key] == value) return this.queueArray[i];
    }
    return null;
  }

  //Find index , Time O(n), Space O(1), n is number of items in queue
  index(value:any, key:any) {
    if (this.isEmpty()) {
      return -1;
    }
    for (
      let i = this.frontIndex;
      i != this.rearIndex;
      i = (i + 1) % this.maxSize
    ) {
      if (this.queueArray[i][key] == value) return i;
    }
    return -1;
  }

  //Delete item , Time O(n), Space O(1), n is number of items in queue
  delete(index:number) {
    if (this.isEmpty()) {
      return;
    }
    this.queueArray[index] = {};
    return;
  }

  //Return front value, Time O(1), Space O(1)
  peek() {
    if (this.isEmpty()) {
      //console.log("Queue is empty");
      return null;
    }
    return this.queueArray[this.frontIndex];
  }

  isEmpty() {
    return this.length == 0;
  }

  isFull() {
    return this.length == this.maxSize;
  }
}
