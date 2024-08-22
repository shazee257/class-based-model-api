import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { formatDate, generateSerialNumber } from './helpers.js';

// generate top header of first page
const topBackgroudColor = [0, 170, 213];
const sectionHeadingColor = [31, 72, 108];
const [minX, minY, maxX, maxY] = [0, 0, 595, 842];

// Function to draw checkbox
function drawCheckbox(doc, x, y, label, checked) {
    // Draw the checkbox border
    doc.rect(x, y, 10, 10).stroke();

    // Draw the checkmark if checked
    if (checked) {
        doc.moveTo(x + 1, y + 5)
            .lineTo(x + 4, y + 9)
            .lineTo(x + 9, y + 1)
            .lineWidth(1).strokeColor('black').stroke();
    }

    // Draw the label
    const textWidth = doc.widthOfString(label);
    doc.fontSize(12).text(label, x + 15, y, { width: textWidth + 10 });
}

function drawRectange(doc, x, y, width, height, color) {
    doc.rect(x, y, width, height).fill(color);
}

// Function to draw text at specified coordinates
function drawText({ doc, text, x, y, color = [36, 36, 36], size = 11, font = 'Helvetica' }) {
    doc.fillColor(color);
    doc.font(font).fontSize(size);
    const textWidth = doc.widthOfString(text);
    doc.text(text, x, y, { width: textWidth + 10 });

    doc.font('Helvetica').fontSize(11);

}

// Function to add clickable links
function drawLink({ doc, text, url, x, y, color = 'blue', size = 9, font = 'Helvetica' }) {
    doc.fillColor(color);
    doc.font(font).fontSize(size);
    const textWidth = doc.widthOfString(text);
    doc.text(text, x, y, { width: textWidth + 10 });
    doc.link(x, y, textWidth, size, url);

    doc.font('Helvetica').fontSize(11);
}

export default function pdfGenerate(activity) {
    let filePath = path.join('./uploads', `${activity?._id}.pdf`); // Specify the file path
    let stream = fs.createWriteStream(filePath); // Create a write stream to the file

    const doc = new PDFDocument({ size: 'A4' });
    doc.font('Helvetica'); // establishes the default font

    // generate first page
    pageOne(doc, activity);

    // generate second page
    pageTwo(doc, activity);

    // generate third page
    pageThree(doc, activity);

    // generate fourth page
    pageFour(doc, activity);

    // generate fifth page
    pageFive(doc, activity);


    // Pipe the PDF document to the write stream
    doc.pipe(stream);

    // Close the document
    doc.end();

    return stream;
}

function drawTableThreeColumns(doc, headings, startX, startY, colWidth, rowHeight, cellPadding, fontSize) {
    const doubleColWidth = colWidth * 2 + 50; // Double width for the first column
    const remainingColWidth = colWidth; // Equal width for the remaining two columns

    headings.forEach((heading, i) => {
        heading.forEach((data, j) => {
            // set bold for first row
            doc.font(i === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize);
            const xPos = startX + (j === 0 ? 0 : j === 1 ? doubleColWidth : doubleColWidth + remainingColWidth);
            const yPos = startY + (i * rowHeight);

            doc.rect(xPos, yPos, j === 0 ? doubleColWidth : remainingColWidth, rowHeight).stroke('gray', 1); // Draw cell border

            doc.text(data, xPos + cellPadding, yPos + cellPadding, {
                width: j === 0 ? doubleColWidth - 2 * cellPadding : remainingColWidth - 2 * cellPadding,
                align: j === 0 && i > 0 ? 'left' : 'center',
            });
        });
    });
}

function drawTable(doc, headings, startX, startY, colWidth, rowHeight, cellPadding, fontSize) {
    headings.forEach((heading, i) => {
        heading.forEach((data, j) => {
            // Set bold for the first row
            doc.font(i === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize);

            // Adjust row height for the first row
            const currentRowHeight = i === 0 ? rowHeight * 2 : rowHeight;

            const xPos = startX + (j * colWidth);
            let yPos;

            if (i === 0) yPos = startY;
            if (i === 1) yPos = startY + rowHeight * 2;
            if (i > 1) yPos = startY + rowHeight + (i * rowHeight);

            doc.rect(xPos, yPos, colWidth, currentRowHeight).stroke('gray', 1); // Draw cell border

            doc.text(data, xPos + cellPadding, yPos + cellPadding, {
                width: colWidth - 2 * cellPadding,
                align: 'center',
                lineBreak: false // Add this line to prevent text overlapping
            });
        });
    });
}

function drawTableNormalWidth(doc, headings, startX, startY, colWidth, rowHeight, cellPadding, fontSize) {
    // set font color black
    doc.fillColor([36, 36, 36]);

    headings.forEach((heading, i) => {
        heading.forEach((data, j) => {
            let xPos = startX + (j * colWidth);
            let yPos = startY + (i * rowHeight);

            doc.rect(xPos, yPos, colWidth, rowHeight).stroke('gray', 1); // Draw cell border

            doc.text(data, xPos + cellPadding, yPos + cellPadding, {
                width: colWidth - 2 * cellPadding,
                align: 'center',
                lineBreak: false // Add this line to prevent text overlapping
            });
        });
    });
}

function drawPageHeader(doc, minX, minY, maxX, topBackgroudColor, activity) {
    // draw rectangle with color
    drawRectange(doc, minX, minY, maxX, 100, topBackgroudColor);
    drawText({ doc, text: 'SOPs No. MK-PR-EN-022', x: minX + 30, y: minY + 15, color: 'white' });
    drawText({ doc, text: 'SAP Code:____________', x: minX + 30, y: minY + 35, color: 'white' });
    drawText({ doc, text: 'Scientific Meeting Approval Form (Local)', x: minX + 30, y: minY + 65, color: 'white', size: 24 });
    drawText({ doc, text: 'Corporate Public Relations Execution Form', x: minX + 340, y: minY + 15, color: 'white', font: 'Helvetica-Bold' });
    drawText({ doc, text: 'Julphar', x: minX + 450, y: minY + 35, color: 'white', size: 28, font: 'Helvetica-Bold' });

    drawText({ doc, text: `Tracking ID: ${generateSerialNumber(activity?.serialNo)}`, x: minX + 450, y: minY + 120 });
    // drawText({ doc, text: `Brand: ${activity?.product.name}`, x: minX + 400, y: minY + 115 });

    drawText({ doc, text: `Meeting Name: ${activity?.meetingName ? activity?.meetingName : ''}`, x: minX + 30, y: minY + 115 });
    // drawText({ doc, text: `SKU: ${activity?.sku.sku}`, x: minX + 400, y: minY + 135 });

    drawText({ doc, text: `Initiator Name: ${activity?.initiatorName ? activity?.initiatorName : ''}`, x: minX + 30, y: minY + 135 });
}

// function to generate pageOne
function pageOne(doc, activity) {
    drawPageHeader(doc, minX, minY, maxX, topBackgroudColor, activity);

    // BRIEF SECTION

    // draw rectangle with color centered
    drawRectange(doc, minX + 30, minY + 160, maxX - 60, 20, sectionHeadingColor);
    // draw text centered in above rectangle
    drawText({ doc, text: 'Brief', x: (maxX / 2) - 30, y: minY + 163, color: 'white', font: 'Helvetica-Bold', size: 16 });

    // draw text From, To
    drawText({ doc, text: `From : ${activity?.brief?.from ? formatDate(activity?.brief?.from) : '____/____/____'}`, x: minX + 30, y: minY + 190 });
    drawText({ doc, text: `To: ${activity?.brief?.to ? formatDate(activity?.brief?.to) : '____/____/____'}`, x: minX + 180, y: minY + 190 });
    // draw text Brand/Franchise
    drawText({ doc, text: `Brand/Franchise: ${activity?.brief?.brandOrFranchise ? activity?.brief?.brandOrFranchise : '_____________________________'}`, x: minX + 30, y: minY + 210 });
    drawText({ doc, text: `Specialities: ${activity?.brief?.specialties ? activity?.brief?.specialties : '_____________________________'}`, x: minX + 300, y: minY + 210 });

    // draw text 'Market(s): _______________________ Total Numbers: Doctors: _________ Staff: _________'
    drawText({ doc, text: `Market(s): ${activity?.brief?.market ? activity?.brief?.market : '_____________________________'} `, x: minX + 30, y: minY + 230 });
    drawText({ doc, text: `Total Numbers: Doctors: ${activity?.brief?.NoOfDoctorsAndStaff?.doctors ? activity?.brief?.NoOfDoctorsAndStaff?.doctors : '_________'}  Staff: ${activity?.brief?.NoOfDoctorsAndStaff?.staff ? activity?.brief?.NoOfDoctorsAndStaff?.staff : '_________'}`, x: minX + 260, y: minY + 230 });

    // draw text 'Budget:*'
    drawText({ doc, text: 'Budget:*', x: minX + 30, y: minY + 250 });
    // add checkbox next to Budget
    drawCheckbox(doc, minX + 80, minY + 250, `Marketing: ${activity?.brief?.budget?.marketing?.amount ? activity?.brief?.budget?.marketing?.amount : '_______'}%`, activity?.brief?.budget?.marketing?.selected ? activity?.brief?.budget?.marketing?.selected : false);
    // add checkbox next to Marketing
    drawCheckbox(doc, minX + 250, minY + 250, `Sales: ${activity?.brief?.budget?.sales?.amount ? activity?.brief?.budget?.sales?.amount : '_________'}%`, activity?.brief?.budget?.sales?.selected ? activity?.brief?.budget?.sales?.selected : false);
    // draw text 'Proposed Venue(s): 1. _________________________ 2. _________________________ 3. _________________________'
    drawText({ doc, text: `Proposed Venue(s): 1. ${activity?.brief?.proposedVenues[0] ? activity?.brief?.proposedVenues[0] + '          ' : '_____________________'} 2. ${activity?.brief?.proposedVenues[1] ? activity?.brief?.proposedVenues[1] + '          ' : '_____________________'} 3. ${activity?.brief?.proposedVenues[2] ? activity?.brief?.proposedVenues[2] + '          ' : '_____________________'}`, x: minX + 30, y: minY + 270 });
    // draw text 'Rational of venue proposed: ___________________________________________________________________________'
    drawText({ doc, text: `Rational of venue proposed: ${activity?.brief?.rationalOfVenueProposed ? activity?.brief?.rationalOfVenueProposed : '_______________________________________________________________'}`, x: minX + 30, y: minY + 290 });
    // draw text 'Average/Delegate: _______________ AED: _______________'
    drawText({ doc, text: `Average/Delegate: ${activity?.brief?.averageDelegate ? activity?.brief?.averageDelegate : '______________'} AED: ${activity?.brief?.aed ? activity?.brief?.aed : '______________'}`, x: minX + 130, y: minY + 310, size: 10 });

    // draw text bold 'Type'
    drawText({ doc, text: 'Type', x: minX + 30, y: minY + 330, font: 'Helvetica-Bold', size: 14 });
    // draw horizontal checkboxes 'Standalone', 'Workshop', 'Symposium', 'Plant visit', 'Cycle meeting', 'Training'
    drawCheckbox(doc, minX + 30, minY + 350, 'Standalone', activity?.brief?.type?.standalone ? activity?.brief?.type?.standalone : false);
    drawCheckbox(doc, minX + 120, minY + 350, 'Workshop', activity?.brief?.type?.workshop ? activity?.brief?.type?.workshop : false);
    drawCheckbox(doc, minX + 200, minY + 350, 'Symposium', activity?.brief?.type?.symposium ? activity?.brief?.type?.symposium : false);
    drawCheckbox(doc, minX + 290, minY + 350, 'Plant visit', activity?.brief?.type?.plantVisit ? activity?.brief?.type?.plantVisit : false);
    drawCheckbox(doc, minX + 370, minY + 350, 'Cycle meeting', activity?.brief?.type?.cycleMeeting ? activity?.brief?.type?.cycleMeeting : false);
    drawCheckbox(doc, minX + 490, minY + 350, 'Training', activity?.brief?.type?.training ? activity?.brief?.type?.training : false);

    // draw horizontal checkboxes '3rd party conference', 'Other (pelase specify) ______________________________',
    drawCheckbox(doc, minX + 30, minY + 370, '3rd party conference', activity?.brief?.type?.thirdPartyConference ? activity?.brief?.type?.thirdPartyConference : false);
    drawCheckbox(doc, minX + 200, minY + 370, `Other (pelase specify) ${activity?.brief?.type?.other?.customType ? activity?.brief?.type?.other?.customType : '_______________________________'}`, activity?.brief?.type?.other?.selected ? activity?.brief?.type?.other?.selected : false);
    // add text '* Tickets are to be allocated to the local market.' small font
    drawText({ doc, text: '* Tickets are to be allocated to the local market.', x: minX + 30, y: minY + 390, size: 10 });

    // OBJECTIVES & ROI SECTION

    // draw rectangle with color centered
    drawRectange(doc, minX + 30, minY + 410, maxX - 60, 20, sectionHeadingColor);
    // draw text centered in above rectangle 'Objecttives & ROI'
    drawText({ doc, text: 'Objectives & ROI', x: (maxX / 2) - 60, y: minY + 413, color: 'white', font: 'Helvetica-Bold', size: 16 });

    // draw text 'A) Qualitative:'
    drawText({ doc, text: 'A) Qualitative:', x: minX + 30, y: minY + 435, size: 14, font: 'Helvetica-Bold' });
    // draw horizontal checkboxes 'New product launch', 'New concept launch'
    drawCheckbox(doc, minX + 30, minY + 460, 'New product launch', activity?.objectivesAndROI?.qualitative?.newProductLaunch ? activity?.objectivesAndROI?.qualitative?.newProductLaunch : false);
    drawCheckbox(doc, minX + 250, minY + 460, 'New concept launch', activity?.objectivesAndROI?.qualitative?.newConceptLaunch ? activity?.objectivesAndROI?.qualitative?.newConceptLaunch : false);
    drawCheckbox(doc, minX + 30, minY + 480, 'Increase market share', activity?.objectivesAndROI?.qualitative?.increaseMarketShare ? activity?.objectivesAndROI?.qualitative?.increaseMarketShare : false);
    drawCheckbox(doc, minX + 250, minY + 480, 'Establish KOL’s long term partnership', activity?.objectivesAndROI?.qualitative?.establishKOLPartnership ? activity?.objectivesAndROI?.qualitative?.establishKOLPartnership : false);
    drawCheckbox(doc, minX + 30, minY + 500, `Others (specify): ${activity?.objectivesAndROI?.qualitative?.othersSpecify?.other ? activity?.objectivesAndROI?.qualitative?.othersSpecify?.other : '_________________________________________________'}`, activity?.objectivesAndROI?.qualitative?.othersSpecify?.selected ? activity?.objectivesAndROI?.qualitative?.othersSpecify?.selected : false);

    // draw text 'B) Quantitative:'
    drawText({ doc, text: 'B) Quantitative:', x: minX + 30, y: minY + 525, size: 14, font: 'Helvetica-Bold' });

    const quantitativeData = activity?.objectivesAndROI?.quantitative?.map((item) => [item?.brand?.name, item?.country, item?.previousYearSalesAED, item?.currentYearTargetAED, item?.growth, item?.expense])
    if (quantitativeData.length === 0) {
        quantitativeData.push(["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""]);
    }

    // make a table with 6 columns and 6 rows
    const tableHeadings = [
        ['Product', 'Countries', 'Previous Year Sales AED', 'Current year Target AED', 'Growth%', 'Expense%'],
        ...quantitativeData
    ];

    // Usage example
    const startX = minX + 30;
    const startY = minY + 545;
    const colWidth = 90;
    const rowHeight = 16;
    const cellPadding = 5;
    const fontSize = 9;

    drawTable(doc, tableHeadings, startX, startY, colWidth, rowHeight, cellPadding, fontSize);

    // draw text 'Initiator Signature: __________________________' & right corner 'Date: _______________'
    drawText({ doc, text: 'Initiator Signature: ___________________________________ ', x: minX + 30, y: minY + 660 });
    if (activity?.initiatorSign) doc.image(activity?.initiatorSign, minX + 180, minY + 638, { width: 100, height: 40 });
    drawText({ doc, text: `Date: ${activity?.objectivesAndROI?.initiatorDate ? formatDate(activity?.objectivesAndROI?.initiatorDate) : '______/______/______'}`, x: minX + 420, y: minY + 660 });

    // draw text 'Allocated Approved Budget'
    drawText({ doc, text: `Allocated Approved Budget: ${activity?.objectivesAndROI?.allocatedApprovedBudget ? activity?.objectivesAndROI?.allocatedApprovedBudget : '____________________________'}`, x: minX + 30, y: minY + 680 });

    // buh signatures mappping
    if (activity?.buh?.length > 0) {
        const buhSignWidth = 100;
        const buhSignHeight = 40;
        const buhSignSpacing = 100;
        const buhSignMinY = minY + 700;

        const buhSignCount = activity?.buh?.length || 0;
        const buhSignTotalWidth = buhSignCount * buhSignSpacing;

        const buhSignStartX = (maxX - buhSignTotalWidth + 180) / 2;

        activity?.buh?.forEach((user, index) => {
            doc.image(user?.sign, buhSignStartX + (index * buhSignSpacing), buhSignMinY, { width: buhSignWidth, height: buhSignHeight });
        });
    }

    drawText({ doc, text: 'Business Unit/Head Signature: ______________________________________________________________', x: minX + 30, y: minY + 730 });
    // drawText({ doc, text: `Date: ${activity.buh?.date ? formatDate(activity.buh?.date) : '______/______/______'}`, x: minX + 420, y: minY + 730 });
}

function pageTwo(doc, activity) {
    doc.addPage();

    drawPageHeader(doc, minX, minY, maxX, topBackgroudColor, activity);

    // MEETING DETAILS SECTION

    // draw rectangle with color centered
    drawRectange(doc, minX + 30, minY + 160, maxX - 60, 20, sectionHeadingColor);
    // draw text centered in above rectangle
    drawText({ doc, text: 'Meeting Details', x: (maxX / 2) - 50, y: minY + 163, color: 'white', font: 'Helvetica-Bold', size: 16 });

    // draw text 'Date: _______________________________'
    drawText({ doc, text: `Date: ${activity?.meetingDetails?.date ? formatDate(activity?.meetingDetails?.date) : '______/______/______'}`, x: minX + 30, y: minY + 190 });
    // draw text 'Number of days: _______________________________'
    drawText({ doc, text: `Number of days: ${activity?.meetingDetails?.noOfDays ? activity?.meetingDetails?.noOfDays : '________________'}`, x: minX + 30, y: minY + 215 });
    // draw text 'Meeting setup'
    drawText({ doc, text: 'Meeting setup', x: minX + 30, y: minY + 240 });

    // checkboxes horizontal "Classroom", "Cabaret (half moon)", "U-shape"
    drawCheckbox(doc, minX + 130, minY + 240, 'Classroom', activity?.meetingDetails?.meetingSetup?.classroom || false);
    drawCheckbox(doc, minX + 250, minY + 240, 'Cabaret (half moon)', activity?.meetingDetails?.meetingSetup?.cabaret || false);
    drawCheckbox(doc, minX + 430, minY + 240, 'U-shape', activity?.meetingDetails?.meetingSetup?.uShape || false);

    // add text 'Meeting time'
    drawText({ doc, text: 'Meeting time', x: minX + 30, y: minY + 265 });
    drawCheckbox(doc, minX + 130, minY + 265, 'Morning', activity?.meetingDetails?.meetingTime?.morning || false);
    drawCheckbox(doc, minX + 250, minY + 265, 'Afternoon', activity?.meetingDetails?.meetingTime?.afternoon || false);
    drawCheckbox(doc, minX + 430, minY + 265, 'Evening', activity?.meetingDetails?.meetingTime?.evening || false);

    // add text 'Projector'
    drawText({ doc, text: 'Projector', x: minX + 30, y: minY + 290 });
    drawCheckbox(doc, minX + 130, minY + 290, '1', activity?.meetingDetails?.projector?.one);
    drawCheckbox(doc, minX + 250, minY + 290, '2', activity?.meetingDetails?.projector?.two);

    // add text 'Signage Logo'
    drawText({ doc, text: `Signage Logo: ${activity?.meetingDetails?.signageLogo ? activity?.meetingDetails?.signageLogo : '________________________________________'}`, x: minX + 30, y: minY + 315 });

    // add text 'Podium'
    drawText({ doc, text: 'Podium', x: minX + 30, y: minY + 340 });
    drawCheckbox(doc, minX + 130, minY + 340, 'Yes', activity?.meetingDetails?.podium?.toLowerCase() === "yes");
    drawCheckbox(doc, minX + 250, minY + 340, 'No', activity?.meetingDetails?.podium?.toLowerCase() === "no");

    // add text 'Headtable'
    drawText({ doc, text: 'Headtable', x: minX + 30, y: minY + 365 });
    drawCheckbox(doc, minX + 130, minY + 365, 'Yes', activity?.meetingDetails?.headTable?.toLowerCase() === "yes");
    drawCheckbox(doc, minX + 250, minY + 365, 'No', activity?.meetingDetails?.headTable?.toLowerCase() === "no");

    // add text 'Microphones'
    drawText({ doc, text: 'Microphones', x: minX + 30, y: minY + 390 });
    drawCheckbox(doc, minX + 130, minY + 390, 'Clip-on Mic', activity?.meetingDetails?.microphones?.clipOn);
    drawCheckbox(doc, minX + 280, minY + 390, 'Podium Mic', activity?.meetingDetails?.microphones?.micPodium);
    drawCheckbox(doc, minX + 430, minY + 390, 'Hand-held Mic', activity?.meetingDetails?.microphones?.micHandheld);

    // add text 'Heavy branding'
    drawText({ doc, text: 'Heavy branding', x: minX + 30, y: minY + 415 });
    drawCheckbox(doc, minX + 130, minY + 415, 'Yes', activity?.meetingDetails?.heavyBranding?.toLowerCase() === "yes");
    drawCheckbox(doc, minX + 250, minY + 415, 'No', activity?.meetingDetails?.heavyBranding?.toLowerCase() === "no");

    // add text 'Photographer'
    drawText({ doc, text: 'Photographer', x: minX + 30, y: minY + 440 });
    drawCheckbox(doc, minX + 130, minY + 440, 'Yes', activity?.meetingDetails?.photographer?.toLowerCase() === "yes");
    drawCheckbox(doc, minX + 250, minY + 440, 'No', activity?.meetingDetails?.photographer?.toLowerCase() === "no");

    // add text 'Videographer'
    drawText({ doc, text: 'Videographer', x: minX + 30, y: minY + 465 });
    drawCheckbox(doc, minX + 130, minY + 465, 'Yes', activity?.meetingDetails?.videographer?.toLowerCase() === "yes");
    drawCheckbox(doc, minX + 250, minY + 465, 'No', activity?.meetingDetails?.videographer?.toLowerCase() === "no");

    // add text 'Sound system'
    drawText({ doc, text: 'Sound system', x: minX + 30, y: minY + 490 });
    drawCheckbox(doc, minX + 130, minY + 490, 'Yes', activity?.meetingDetails?.soundSystem?.toLowerCase() === "yes");
    drawCheckbox(doc, minX + 250, minY + 490, 'No', activity?.meetingDetails?.soundSystem?.toLowerCase() === "no");

    // add text 'Coffee break'
    drawText({ doc, text: 'Coffee break', x: minX + 30, y: minY + 515 });
    drawCheckbox(doc, minX + 130, minY + 515, 'Yes', activity?.meetingDetails?.coffeeBreak?.selected?.toLowerCase() === "yes");
    drawCheckbox(doc, minX + 250, minY + 515, 'No', activity?.meetingDetails?.coffeeBreak?.selected?.toLowerCase() === "no");
    drawCheckbox(doc, minX + 310, minY + 515, '1', activity?.meetingDetails?.coffeeBreak?.one);
    drawCheckbox(doc, minX + 370, minY + 515, '2', activity?.meetingDetails?.coffeeBreak?.two);

    // SOCIAL ACTIVITIES SECTION

    // draw rectangle with color centered
    drawRectange(doc, minX + 30, minY + 540, maxX - 60, 20, sectionHeadingColor);
    // draw text centered in above rectangle
    drawText({ doc, text: 'Social Activities', x: (maxX / 2) - 50, y: minY + 543, color: 'white', font: 'Helvetica-Bold', size: 16 });

    // add text "Lunch"
    drawText({ doc, text: 'Lunch', x: minX + 30, y: minY + 570 });
    drawCheckbox(doc, minX + 200, minY + 570, 'Yes', activity?.socialActivities?.lunch?.toLowerCase() === "yes");
    drawCheckbox(doc, minX + 360, minY + 570, 'No', activity?.socialActivities?.lunch?.toLowerCase() === "no");

    // add text "Dinner"
    drawText({ doc, text: 'Dinner', x: minX + 30, y: minY + 595 });
    drawCheckbox(doc, minX + 200, minY + 595, 'Yes', activity?.socialActivities?.dinner?.toLowerCase() === "yes");
    drawCheckbox(doc, minX + 360, minY + 595, 'No', activity?.socialActivities?.dinner?.toLowerCase() === "no");

    // add text "Numbers of rooms for invitees"
    drawText({ doc, text: 'Numbers of rooms for invitees', x: minX + 30, y: minY + 620 });
    drawCheckbox(doc, minX + 200, minY + 620, `Single: ${activity?.socialActivities?.noOfRoomsForInvitees?.single?.singleNumber || '____________'}`, activity?.socialActivities?.noOfRoomsForInvitees?.single?.selected || false);
    drawCheckbox(doc, minX + 360, minY + 620, `Double: ${activity?.socialActivities?.noOfRoomsForInvitees?.double?.doubleNumber || '____________'}`, activity?.socialActivities?.noOfRoomsForInvitees?.double?.selected || false);

    // add text "Numbers of rooms for staff"
    drawText({ doc, text: 'Numbers of rooms for staff', x: minX + 30, y: minY + 645 });
    drawCheckbox(doc, minX + 200, minY + 645, `Single: ${activity?.socialActivities?.noOfRoomsForStaff?.single?.singleNumber || '____________'}`, activity?.socialActivities?.noOfRoomsForStaff?.single?.selected || false);
    drawCheckbox(doc, minX + 360, minY + 645, `Double: ${activity?.socialActivities?.noOfRoomsForStaff?.double?.doubleNumber || '____________'}`, activity?.socialActivities?.noOfRoomsForStaff?.double?.selected || false);

    // add text "Booking dates"
    drawText({ doc, text: 'Booking dates', x: minX + 30, y: minY + 670 });
    drawText({ doc, text: `Check in: ${activity?.socialActivities?.bookingDates?.checkIn ? formatDate(activity?.socialActivities?.bookingDates?.checkIn) : '______/_____/_____'}`, x: minX + 200, y: minY + 670 });
    drawText({ doc, text: `Check out: ${activity?.socialActivities?.bookingDates?.checkOut ? formatDate(activity?.socialActivities?.bookingDates?.checkOut) : '______/______/______'}`, x: minX + 360, y: minY + 670 });
    // drawCheckbox(doc, minX + 200, minY + 670, `Check in: ${formatDate(activity?.meetingDetails?.bookingDates?.checkIn)}`, false);
    // drawCheckbox(doc, minX + 360, minY + 670, `Check out: _______`, false);

    // add text "Other requirements"
    drawText({ doc, text: `Other requirements: ${activity?.socialActivities?.otherRequirements || '_____________________________________________________________'}`, x: minX + 30, y: minY + 695 });
    // drawText({ doc, text: '_____________________________________________________________________________________', x: minX + 30, y: minY + 710 });

    // draw text 'Initiator Signature: __________________________' & right corner 'Date: _______________'
    // drawText({ doc, text: `Initiator Signature: ${activity?.socialActivities?.initiator?.signature || '______________________________'}`, x: minX + 30, y: minY + 745 });
    drawText({ doc, text: 'Initiator Signature: ___________________________________ ', x: minX + 30, y: minY + 745 });
    if (activity?.initiatorSign) doc.image(activity?.initiatorSign, minX + 150, minY + 720, { width: 100, height: 40 });
    drawText({ doc, text: `Date: ${activity?.socialActivities?.initiatorDate ? formatDate(activity?.socialActivities?.initiatorDate) : '______/______/______'}`, x: minX + 420, y: minY + 745 });
}

function pageThree(doc, activity) {
    doc.addPage();

    drawPageHeader(doc, minX, minY, maxX, topBackgroudColor, activity);

    // Scientific Meeting Expenses (Marketing/Sales) SECTION

    // draw rectangle with color centered
    drawRectange(doc, minX + 30, minY + 160, maxX - 60, 20, sectionHeadingColor);
    // draw text centered in above rectangle
    drawText({ doc, text: 'Scientific Meeting Expenses (Marketing/Sales)', x: (maxX / 2) - 200, y: minY + 163, color: 'white', font: 'Helvetica-Bold', size: 16 });

    const firstTableHeadings = [
        ['Category (Please select the related categories)', 'Average cost (AED)', 'Allocation'],
        ['Registration', activity?.scientificMarketingSales?.registration?.averageCost || '', activity?.scientificMarketingSales?.registration?.allocation || ''],
        ['Sponsorship fees/ exhibition space', activity?.scientificMarketingSales?.sponsorshipFeesExhibitionSpace?.averageCost || '', activity?.scientificMarketingSales?.sponsorshipFeesExhibitionSpace?.allocation || ''],
        ['Honorarium', activity?.scientificMarketingSales?.honorarium?.averageCost || '', activity?.scientificMarketingSales?.honorarium?.allocation || ''],
        ['Branding', activity?.scientificMarketingSales?.branding?.averageCost || '', activity?.scientificMarketingSales?.branding?.allocation || ''],
        ['Gifts', activity?.scientificMarketingSales?.gifts?.averageCost || '', activity?.scientificMarketingSales?.gifts?.allocation || ''],
        ['CME fee', activity?.scientificMarketingSales?.cmeFee?.averageCost || '', activity?.scientificMarketingSales?.cmeFee?.allocation || ''],
        ['Others', activity?.scientificMarketingSales?.others?.averageCost || '', activity?.scientificMarketingSales?.others?.allocation || ''],
        ['Total', activity?.scientificMarketingSales?.total?.averageCost || '', activity?.scientificMarketingSales?.total?.allocation || '']
    ];

    // Usage example
    const startX = minX + 30;
    const startY = minY + 190;
    const colWidth = 120;
    const rowHeight = 18;
    const cellPadding = 5;
    const fontSize = 9;

    doc.fillColor([60, 60, 60]);

    drawTableThreeColumns(doc, firstTableHeadings, startX, startY, colWidth, rowHeight, cellPadding, fontSize);

    // draw text 'Other Details: ____________________________________________________________________________________'
    drawText({ doc, text: `Other Details: ${activity?.scientificMarketingSales?.otherDetails || '_________________________________________________________________'}`, x: minX + 30, y: minY + 360 });

    // draw text 'Marketing: Manager/Lead: __________________________' & right corner 'Date: _______________'
    // drawText({ doc, text: 'Marketing Head: ______________________________', x: minX + 30, y: minY + 390 });
    // // activity.mhSign
    // if (activity?.mh?.sign) doc.image(activity?.mh?.sign, minX + 160, minY + 365, { width: 100, height: 40 });
    // drawText({ doc, text: `Date: ${activity?.mh?.date ? formatDate(activity?.mh?.date) : '______/______/______'}`, x: minX + 420, y: minY + 390 });

    // buh signatures mappping
    if (activity?.mh?.length > 0) {
        const buhSignWidth = 100;
        const buhSignHeight = 40;
        const buhSignSpacing = 100;
        const buhSignMinY = minY + 365;

        const buhSignCount = activity?.mh?.length || 0;
        const buhSignTotalWidth = buhSignCount * buhSignSpacing;

        const buhSignStartX = (maxX - buhSignTotalWidth + 120) / 2;

        activity?.mh?.forEach((user, index) => {
            doc.image(user?.sign, buhSignStartX + (index * buhSignSpacing), buhSignMinY, { width: buhSignWidth, height: buhSignHeight });
        });
    }

    drawText({ doc, text: 'Marketing Head: ________________________________________________________________________', x: minX + 30, y: minY + 390 });




    // drawText({ doc, text: 'Portfolio Manager: ______________________________', x: minX + 30, y: minY + 415 });
    // if (activity?.pm?.sign) doc.image(activity?.pm?.sign, minX + 160, minY + 392, { width: 100, height: 40 });
    // drawText({ doc, text: `Date: ${activity.pm?.date ? formatDate(activity.pm?.date) : '______/______/______'}`, x: minX + 420, y: minY + 415 });

    // pm signatures mappping
    if (activity?.pm?.length > 0) {
        const buhSignWidth = 100;
        const buhSignHeight = 40;
        const buhSignSpacing = 100;
        const buhSignMinY = minY + 390;

        const buhSignCount = activity?.pm?.length || 0;
        const buhSignTotalWidth = buhSignCount * buhSignSpacing;

        const buhSignStartX = (maxX - buhSignTotalWidth + 100) / 2;

        activity?.pm?.forEach((user, index) => {
            doc.image(user?.sign, buhSignStartX + (index * buhSignSpacing), buhSignMinY, { width: buhSignWidth, height: buhSignHeight });
        });
    }

    drawText({ doc, text: 'Portfolio Manager: _______________________________________________________________________', x: minX + 30, y: minY + 415 });





    // draw rectangle with color centered
    drawRectange(doc, minX + 30, minY + 440, maxX - 60, 20, sectionHeadingColor);
    // draw text centered in above rectangle
    drawText({ doc, text: 'Scientific Meeting Expenses (PR)', x: (maxX / 2) - 120, y: minY + 443, color: 'white', font: 'Helvetica-Bold', size: 16 });

    // draw text 'Actual expenses should not exceed the pre-planning approved expenses'
    drawText({ doc, text: 'Actual expenses should not exceed the pre-planning approved expenses', x: minX + 30, y: minY + 470 });

    const secondTableHeadings = [
        ['Category (Please select the related categories)', 'Average cost (AED)', 'Allocation'],
        ['Accommodation', `${activity?.scientificMeetingExpensesPR?.accommodation?.averageCost || ''}`, `${activity?.scientificMeetingExpensesPR?.accommodation?.allocation || ''}`],
        ['Dining', `${activity?.scientificMeetingExpensesPR?.dining?.averageCost || ''}`, `${activity?.scientificMeetingExpensesPR?.dining?.allocation || ''}`],
        ['Transportation', `${activity?.scientificMeetingExpensesPR?.transportation?.averageCost || ''}`, `${activity?.scientificMeetingExpensesPR?.transportation?.allocation || ''}`],
        ['Meeting room rent and facilities', `${activity?.scientificMeetingExpensesPR?.meetingRoomRentAndFacilities?.averageCost || ''}`, `${activity?.scientificMeetingExpensesPR?.meetingRoomRentAndFacilities?.allocation || ''}`],
        ['Gala Dinner', `${activity?.scientificMeetingExpensesPR?.galaDinner?.averageCost || ''}`, `${activity?.scientificMeetingExpensesPR?.galaDinner?.allocation || ''}`],
        ['Entertainment', `${activity?.scientificMeetingExpensesPR?.entertainment?.averageCost || ''}`, `${activity?.scientificMeetingExpensesPR?.entertainment?.allocation || ''}`],
        ['Others', `${activity?.scientificMeetingExpensesPR?.others?.averageCost || ''}`, `${activity?.scientificMeetingExpensesPR?.others?.allocation || ''}`],
        ['Total', `${activity?.scientificMeetingExpensesPR?.total?.averageCost || ''}`, `${activity?.scientificMeetingExpensesPR?.total?.allocation || ''}`]
    ];

    drawTableThreeColumns(doc, secondTableHeadings, startX, minY + 500, colWidth, rowHeight, cellPadding, fontSize);

    // draw text 'City: __________________________' & right side 'Hodel name: ____________________________'
    drawText({ doc, text: `City: ${activity?.scientificMeetingExpensesPR?.city ? activity?.scientificMeetingExpensesPR?.city : '__________________________'}`, x: minX + 30, y: minY + 670 });
    drawText({ doc, text: `Hotel name: ${activity?.scientificMeetingExpensesPR?.hotelName ? activity?.scientificMeetingExpensesPR?.hotelName : '__________________________'}`, x: minX + 300, y: minY + 670 });

    // draw text 'Average cost (all inclusive): Single: __________ Double: __________'
    drawText({ doc, text: `Average cost (all inclusive): Single: ${activity?.scientificMeetingExpensesPR?.averageCost?.single ? activity?.scientificMeetingExpensesPR?.averageCost?.single : '________________'} Double: ${activity?.scientificMeetingExpensesPR?.averageCost?.double ? activity?.scientificMeetingExpensesPR?.averageCost?.double : '________________'}`, x: minX + 30, y: minY + 690 });

    // draw text 'Speaker(s) cost (tickets/accommodation):'
    drawText({ doc, text: `Speaker(s) cost (tickets/accommodation): ${activity?.scientificMeetingExpensesPR?.speakersCost ? activity?.scientificMeetingExpensesPR?.speakersCost : '___________________________________________________'}`, x: minX + 30, y: minY + 715 });

    drawText({ doc, text: `Corporate PR & Communication Director Signature : ${activity?.scientificMeetingExpensesPR?.corporatePRCommunicationDirector?.signature ? activity?.scientificMeetingExpensesPR?.corporatePRCommunicationDirector?.signature : '____________________'}`, x: minX + 30, y: minY + 740 });
    drawText({ doc, text: `Date: ${activity?.scientificMeetingExpensesPR?.corporatePRCommunicationDirector?.date ? formatDate(activity?.scientificMeetingExpensesPR?.corporatePRCommunicationDirector?.date) : '______/______/______'}`, x: minX + 420, y: minY + 740 });
}

function pageFour(doc, activity) {
    doc.addPage();

    drawPageHeader(doc, minX, minY, maxX, topBackgroudColor, activity);

    // Scientific Meeting Expenses (Marketing/Sales) SECTION

    // draw rectangle with color centered
    drawRectange(doc, minX + 30, minY + 160, maxX - 60, 20, sectionHeadingColor);
    // draw text centered in above rectangle
    drawText({ doc, text: 'Total Cost', x: (maxX / 2) - 80, y: minY + 163, color: 'white', font: 'Helvetica-Bold', size: 16 });

    // draw two column table
    const tableHeadings = [
        ['Scientific Meeting Expenses (Marketing/Sales)', activity?.totalCost?.scientificMeetingExpensesMarketingSales || 0],
        ['Scientific Meeting Expenses (PR)', activity?.totalCost?.scientificMeetingExpensesPR || 0],
        ['Guest Expenses', activity?.totalCost?.guestExpenses || 0],
        ['Total', activity?.totalCost?.total || 0]
    ];

    // draw table
    const colWidth = 265;
    const rowHeight = 16;
    const cellPadding = 5;
    const fontSize = 9;
    const startX = minX + 30;
    const startY = minY + 190;

    drawTableNormalWidth(doc, tableHeadings, startX, startY, colWidth, rowHeight, cellPadding, fontSize);

    // draw text 'Date: _______________' right corner
    drawText({ doc, text: `Date: ${activity?.totalCost?.date ? formatDate(activity?.totalCost?.date) : '______/______/______'}`, x: minX + 420, y: minY + 270 });

    drawRectange(doc, minX + 30, minY + 350, maxX - 60, 20, sectionHeadingColor);
    // draw text centered in above rectangle
    drawText({ doc, text: 'Approvals', x: (maxX / 2) - 60, y: minY + 353, color: 'white', font: 'Helvetica-Bold', size: 16 });

    // draw rectangle on Country Head Block
    drawRectange(doc, minX + 30, minY + 390, 530, 60, [220, 220, 220]);

    // draw text 'Country Head'
    drawText({ doc, text: 'Country Head', x: minX + 50, y: minY + 415 });
    drawText({ doc, text: `Signature: _______________________________`, x: minX + 290, y: minY + 410 });
    if (activity?.ch?.length > 0) doc.image(activity?.ch[activity?.ch?.length - 1]?.sign, minX + 400, minY + 385, { width: 100, height: 40 });
    drawText({ doc, text: activity?.ch?.length > 0 ? `Date: ${formatDate(activity?.ch[activity?.ch?.length - 1]?.date)}` : 'Date: ____________________________________', x: minX + 290, y: minY + 430 });

    // GCC Director Block
    // draw rectangle on GCC Director Block
    drawRectange(doc, minX + 30, minY + 460, 530, 60, [220, 220, 220]);
    // draw text 'Signature: __________________________' at right corner
    drawText({ doc, text: 'Signature: _______________________________', x: minX + 290, y: minY + 480 });

    drawText({ doc, text: 'GCC Director', x: minX + 50, y: minY + 485 });
    if (activity?.gcc?.length > 0) doc.image(activity?.gcc[activity?.gcc?.length - 1]?.sign, minX + 400, minY + 455, { width: 100, height: 40 });

    // draw text 'Date: _______________' at right corner
    drawText({ doc, text: activity?.gcc?.length > 0 ? `Date: ${formatDate(activity?.gcc[activity?.gcc?.length - 1]?.date)}` : 'Date: ____________________________________', x: minX + 290, y: minY + 500 });

    // Corporate PR & Communication Director Block
    // draw rectangle on Corporate PR & Communication Director Block
    drawRectange(doc, minX + 30, minY + 530, 530, 60, [220, 220, 220]);
    // draw text 'Signature: __________________________' at right corner
    drawText({ doc, text: 'Signature: _______________________________', x: minX + 290, y: minY + 540 });
    // draw text 'Corporate PR & Communication Director'
    drawText({ doc, text: 'Corporate PR & Communication Director', x: minX + 50, y: minY + 555 });
    // draw text 'Date: _______________' at right corner
    drawText({ doc, text: 'Date: ____________________________________', x: minX + 290, y: minY + 570 });

    // Finance Department Block
    // draw rectangle on Finance Department Block
    drawRectange(doc, minX + 30, minY + 600, 530, 60, [220, 220, 220]);
    // draw text 'Signature: __________________________' at right corner
    drawText({ doc, text: 'Signature: _______________________________', x: minX + 290, y: minY + 610 });
    // draw text 'Finance Department'
    drawText({ doc, text: 'Finance Department', x: minX + 50, y: minY + 625 });
    // draw text 'Date: _______________' at right corner
    drawText({ doc, text: 'Date: ____________________________________', x: minX + 290, y: minY + 640 });

    // Chief Commercial Officer/General Manager Block
    // draw rectangle on Chief Commercial Officer/General Manager Block
    drawRectange(doc, minX + 30, minY + 670, 530, 60, [220, 220, 220]);
    // draw text 'Signature: __________________________' at right corner
    drawText({ doc, text: 'Signature: _______________________________', x: minX + 290, y: minY + 680 });
    // draw text 'Chief Commercial Officer/General Manager'
    drawText({ doc, text: 'Chief Commercial Officer/General Manager', x: minX + 50, y: minY + 695 });
    // draw text 'Date: _______________' at right corner
    drawText({ doc, text: 'Date: ____________________________________', x: minX + 290, y: minY + 710 });
}

function pageFive(doc, activity) {
    doc.addPage();

    drawPageHeader(doc, minX, minY, maxX, topBackgroudColor, activity);

    // Scientific Meeting Expenses (Marketing/Sales) SECTION

    // draw rectangle with color centered
    drawRectange(doc, minX + 30, minY + 160, maxX - 60, 20, sectionHeadingColor);
    // draw text centered in above rectangle
    drawText({ doc, text: 'Beneficiary Detail', x: (maxX / 2) - 80, y: minY + 163, color: 'white', font: 'Helvetica-Bold', size: 16 });

    // draw text 'Beneficiary Name: __________________________'
    drawText({ doc, text: `Beneficiary Name: ${activity?.beneficiary?.beneficiaryName ?? '__________________________'}`, x: minX + 30, y: minY + 200 });
    // draw text 'Work Place' at right corner
    drawText({ doc, text: `Work Place: ${activity?.beneficiary?.workPlace ?? '_________________________________'}`, x: minX + 300, y: minY + 200 });

    // draw text 'Specialty: __________________________'
    drawText({ doc, text: `Specialty: ${activity?.beneficiary?.speciality ?? '_________________________________'}`, x: minX + 30, y: minY + 225 });
    // draw text 'Bank Address' at right corner
    drawText({ doc, text: `Bank Address: ${activity?.beneficiary?.bankAddress ?? '_______________________________'}`, x: minX + 300, y: minY + 225 });

    // add Bank Name & Branch Name
    drawText({ doc, text: `Bank Name: ${activity?.beneficiary?.bankName ?? '_______________________________'}`, x: minX + 30, y: minY + 250 });
    drawText({ doc, text: `Branch Name: ${activity?.beneficiary?.bankBranch ?? '_______________________________'}`, x: minX + 300, y: minY + 250 });

    // add IBAN & Amount
    drawText({ doc, text: `IBAN: ${activity?.beneficiary?.iban ?? '____________________________________'}`, x: minX + 30, y: minY + 275 });
    drawText({ doc, text: `Amount: ${activity?.beneficiary?.amount ?? '____________________________________'}`, x: minX + 300, y: minY + 275 });

    // add Bank Swift Code & Curr
    drawText({ doc, text: `Bank Swift Code: ${activity?.beneficiary?.bankSwiftCode ?? '___________________________'}`, x: minX + 30, y: minY + 300 });
    drawText({ doc, text: `Curr: ${activity?.beneficiary?.curr ?? '_______________________________________'}`, x: minX + 300, y: minY + 300 });

    // add Ref Event & Country
    drawText({ doc, text: `Ref Event: ${activity?.beneficiary?.refEvent ?? '________________________________'}`, x: minX + 30, y: minY + 325 });
    drawText({ doc, text: `Country: ${activity?.beneficiary?.country ?? '____________________________________'}`, x: minX + 300, y: minY + 325 });

    // show attachments
    drawText({ doc, text: 'Attachments:', x: minX + 30, y: minY + 350 });
    if (activity?.beneficiary?.attachments && activity?.beneficiary?.attachments.length > 0) {
        activity.beneficiary.attachments.forEach((attachment, index) => {
            const yPosition = minY + 370 + (index * 15); // Increased space between each link
            const displayText = `${String.fromCharCode(8226)} Document ${index + 1}`; // Using bullet and descriptive text
            drawLink({ doc, text: displayText, url: attachment, x: minX + 30, y: yPosition });
        });
    }
}