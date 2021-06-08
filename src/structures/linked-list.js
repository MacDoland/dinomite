class SinglyLinkedList {
    length;
    head;
    tail;
    constructor() {
        this.#clear();
    }

    push(value) {
        const node = new SinglyLinkedListNode(value);

        if (!this.head) {
            this.head = node;
            this.tail = this.head;
        }
        else {
            this.tail.setNext(node);
            this.tail = node;
        }

        this.length += 1;

        return this;
    }

    pop() {
        if (this.length === 0) return undefined;
        let currentNode = this.head;
        let newTail = currentNode;

        while (currentNode.next()) {
            newTail = currentNode;
            currentNode = currentNode.next();
        }

        this.tail = newTail;
        this.tail.setNext(null);
        this.length -= 1;
        return currentNode;
    }

    shift() {
        let node = this.head;
        if (this.head) {
            this.head = this.head.next();
            this.length -= 1;

        }
        return node;
    }

    unshift(value) {
        const node = new SinglyLinkedListNode(value);

        if (!this.head) {
            this.head = node;
            this.tail = this.head;
        }
        else {
            node.setNext(this.head);
            this.head = node;
        }

        this.length += 1;
        return this;
    }

    // length() {
    //     let length = 0;
    //     let node = this.head;

    //     while (node.next()) {
    //         length++;
    //         node = node.next();
    //     }

    //     return length;
    // }

    #clear() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }
}

class SinglyLinkedListNode {
    #next;
    #value;

    constructor(value) {
        this.#next = null;
        this.#value = value;
    }

    value() {
        return this.#value;
    }

    next() {
        return this.#next;
    }

    setNext(node) {
        this.#next = node;
    }

    setValue(value) {
        this.#value = value;
    }
}

export default SinglyLinkedList;