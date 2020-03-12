import { assert } from "chai";
import { parseTimeFromArgs, isTimeLoggedCriteria } from "../src/util";

describe('Util', () => {

    describe('parseTimeFromArgs()', () => {

        // Test cases for parsing time between commands
        const testCases = [
            {
                it: 'should parse @7:37 AM',
                args: ['@7:37', 'AM'],
                expect: '7:37'
            },
            {
                it: 'should parse @8:03',
                args: ['@8:03'],
                expect: '8:03'
            },
            {
                it: 'should parse @8:14am',
                args: ['@8:14am'],
                expect: '8:14'
            },
            {
                it: 'should parse @8:14p',
                args: ['@8:14p'],
                expect: '20:14'
            },
            {
                it: 'should parse @8p',
                args: ['@8p'],
                expect: '20:00'
            },
            {
                it: 'should parse @4 PM',
                args: ['@4', 'PM'],
                expect: '16:00'
            }
        ];

        testCases.forEach((testCase) => {
            it(testCase.it, async () => {
                // Arrange

                // Act
                const result = parseTimeFromArgs(testCase.args);

                // Assert
                assert(result.toString().includes(testCase.expect));
            });

        });

    });

    describe('isTimeLoggedCriteria()', () => {

        // Test cases for parsing time between commands
        const criteria = [
            'today', 'yesterday', 'week', 'last-week', 'month',
            'last-month', 'year', 'last-year', 'all'
        ];

        criteria.forEach((criteria) => {
            it(criteria, async () => {
                // Arrange

                // Act
                const result = isTimeLoggedCriteria(criteria);

                // Assert
                assert(result);
            });

        });

        it('invalid', () => assert(!isTimeLoggedCriteria('invalid')));

    });

});
