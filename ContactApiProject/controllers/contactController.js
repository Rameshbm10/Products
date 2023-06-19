const joi = require('joi');
const connection = require('../models/connection')
const CustomErrorHandler = require('../services/CustomErrorHandler')

const contactController = {
    async create(req, res, next) {
        const requestPayloadSchema = joi.object({
            email: joi.string().email().required(),
            phoneNumber: joi.string()
        })
        const { error } = requestPayloadSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        try {
            // Find the primary contact
            const findPrimaryContactQuery = `
                SELECT * FROM Contact
                WHERE email = ? OR phoneNumber = ?
                ORDER BY linkPrecedence
                LIMIT 1
                `;

            connection.query(
                findPrimaryContactQuery,
                [email, phoneNumber],
                (error, results) => {

                    if (error) {
                        res.status(500).json({ error: 'Error querying the database' });
                        return;
                    }

                    if (results.length > 0) {
                        const primaryContact = results[0];

                        // Find secondary contacts linked to the primary contact
                        const findSecondaryContactsQuery = `
                             SELECT * FROM Contact
                             WHERE linkedId = ?
                             `;

                        connection.query(
                            findSecondaryContactsQuery,
                            [primaryContact.id],
                            (secondaryError, secondaryResults) => {
                                if (secondaryError) {
                                    res.status(500).json({ error: 'Error querying the database' });
                                    return;
                                }

                                // Consolidate emails and phoneNumbers
                                const emails = [primaryContact.email];
                                const phoneNumbers = [primaryContact.phoneNumber];
                                const secondaryContactIds = secondaryResults.map(
                                    (contact) => contact.id
                                );

                                // Return the consolidated contact information
                                res.status(200).json({
                                    contact: {
                                        primaryContatctId: primaryContact.id,
                                        emails,
                                        phoneNumbers,
                                        secondaryContactIds,
                                    },
                                });
                            }
                        );
                    } else {
                        // Create a new primary contact if not found
                        const newContact = {
                            email,
                            phoneNumber,
                            linkedId: null,
                            linkPrecedence: 'primary',
                        };

                        connection.query('INSERT INTO Contact SET ?', newContact, (insertError, insertResult) => {
                            if (insertError) {
                                res.status(500).json({ error: 'Error inserting into the database' });
                                return;
                            }

                            newContact.id = insertResult.insertId;

                            // Return the newly created primary contact
                            res.status(200).json({
                                contact: {
                                    primaryContatctId: newContact.id,
                                    emails: [newContact.email],
                                    phoneNumbers: [newContact.phoneNumber],
                                    secondaryContactIds: [],
                                },
                            });
                        });
                    }
                }
            )

        } catch (error) {
            return next(error)
        }
    }
}
module.exports = contactController;