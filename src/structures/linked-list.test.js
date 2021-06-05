import { expect } from '@jest/globals';
import SinglyLinkedList from './linked-list.js';

describe('SinglyLinkedList', () => {
    it('should set expected initial values on construction', () => {
        //Arrange
        //Act
        const list = new SinglyLinkedList();

        //Assert
        expect(list.head).toEqual(null);
        expect(list.tail).toEqual(null);
        expect(list.length).toEqual(0);
    });

    describe('push', () => {
        it('should set head and tail to new node - the first time called', () => {
            //Arrange
            const list = new SinglyLinkedList();

            //Act
            list.push(1);

            //Assert
            expect(list.head.value()).toEqual(1);
            expect(list.tail.value()).toEqual(1);
            expect(list.length).toEqual(1);
        });

        it('should set tail to new node', () => {
            //Arrange
            const list = new SinglyLinkedList();
            list.push(10);

            //Act
            list.push(20);

            //Assert
            expect(list.head.value()).toEqual(10);
            expect(list.tail.value()).toEqual(20);
            expect(list.length).toEqual(2);
        });

        it('should enable a chain of nexts to retrieve a value', ()=>{
               //Arrange
               const list = new SinglyLinkedList();
               list.push(10);
               list.push(20);
               list.push(30);
   
               //Act
               const value = list.head.next().next().value();

               //Assert
               expect(value).toEqual(30);
        })
    });
   
})