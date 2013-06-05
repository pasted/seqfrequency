function parseSequence(textElement)
  {
    var i = 0;
    clearResults();
    var inputStr = textElement.value;
    if(inputStr.length > 0)
      {
        var lines = "";
        if(checkFastaFormat(inputStr))
          {
            lines = new fastaReader(inputStr);
          }
        else
          {
            lines = textElement.value.split(/\r\n|\r|\n/);
          }
      while(lines[i])
        {
          if(lines[i].length > 0)
            {
              sequenceObj = new sequence(lines[i]);
              sequenceObj.calculateFrequency();
              renderResults(document.getElementById("input-results-div"), sequenceObj, getOrdinal(i + 1));
              sequenceObj.checkDegeneracy();
              i++;
            }
        }
      }
    else
      {
       renderError(document.getElementById("error-div"), "No sequence data in field.")
      }
  }

function checkFastaFormat(str)
  {
    if(str.indexOf('>') == 0)
      {
        return true;
      }
    else
      {
        return false;
      }
  }
  
function clearResults()
  {
   //clear previous results
   document.getElementById("input-results-div").innerHTML = '';	
  }

function renderError(element, errorMsg)
  {
   var currentDate = new Date;
   element.innerHTML += "<hr></hr>";
   element.innerHTML += currentDate;
   element.innerHTML += "<br></br>";
   element.innerHTML += errorMsg
   element.innerHTML += "<hr></hr>";
   element.innerHTML += "<br></br>";
  }

function renderResults(element, sequenceObj, i) 
  {
    //render the results to the results frame by calling
    //a method of the sequenceObj
    element.innerHTML += sequenceObj.toHTML(i);
  }
  
function getOrdinal(n) 
  {
   //sourced from http://stackoverflow.com/questions/12487422/take-a-value-1-31-and-convert-it-to-ordinal-date-w-javascript
   var s = ["th","st","nd","rd"];
   var v = n % 100;
   return n + (s[(v-20)%10]||s[v]||s[0]);
  }

//main sequence model class, contains functions for handling the sequence data
function sequence(thisSequence)
  {
   //instance variable for the DNA sequence, split the 
   //sequence string into an array of individual characters
   //after calling toUpperCase on it (in case any of the characters
   //are lower case a,t,g, or c) and trim to remove whitespace.

   var trimSequence = thisSequence.replace(/\s/g, "");
   var upperCaseSequence = trimSequence.toUpperCase();

   this.DNASequence = upperCaseSequence.split("");
   
   //instance variables for the frequency of the four DNA bases
   this.adenineFrequency = 0;
   this.thymineFrequency = 0;
   this.guanineFrequency = 0;
   this.cytosineFrequency = 0;
   
   //instance variables for extended nucleic acid notation
   //if ambiguity exists
   //R :: purine :: G or A
   this.purineFrequency = 0; 
   //Y :: pyrimidine :: T or C
   this.pyrimidineFrequency = 0;
   //K :: keto :: G or T
   this.ketoFrequency = 0;
   //M :: amino :: A or C
   this.aminoFrequency = 0;
   //S :: strong bonds :: G or C
   this.strongBondsFrequency = 0;
   //W :: weak bonds :: A or T
   this.weakBondsFrequency = 0;
   //B :: any but Adenine
   this.anyButAdenineFrequency = 0;
   //D :: any but Cytosine
   this.anyButCytosineFrequency = 0;
   //H :: any but Guanine
   this.anyButGuanineFrequency = 0;
   //V :: any but Thymine
   this.anyButThymineFrequency = 0;
   //N :: any nucleic acid A, T, G or C
   this.anyNucleicAcidFrequency = 0;
   
   //if Uracil maybe alert user that this sequence is
   //RNA
   this.uracilFrequency = 0;
   
   //instance variable for frequency of any unknown residues
   this.unknownFrequency = 0;
   
   //private function to calculate frequency from sequence string
   this.calculateFrequency = function()
     {
       if(this.DNASequence.length > 0)
         {
           var i = 0;
           while(this.DNASequence[i])
           {
             switch(this.DNASequence[i])
               {
                 case 'A': this.adenineFrequency += 1;
                           break;
                 case 'T': this.thymineFrequency += 1;
                           break;
                 case 'G': this.guanineFrequency += 1;
                           break;
                 case 'C': this.cytosineFrequency += 1;
                           break;
                 case 'R': this.purineFrequency += 1;
                           break;
                 case 'Y': this.pyrimidineFrequency += 1;
                 	   break;
                 case 'K': this.ketoFrequency += 1;
                 	   break;
                 case 'M': this.aminoFrequency += 1;
                 	   break;
                 case 'S': this.strongBondsFrequency += 1;
                 	   break;
                 case 'W': this.weakBondsFrequency += 1;
                 	   break;
                 case 'B': this.anyButAdenineFrequency += 1;
                 	   break;
                 case 'D': this.anyButCytosineFrequency += 1;
                 	   break;
                 case 'H': this.anyButGuanineFrequency += 1;
                 	   break;
                 case 'V': this.anyButThymineFrequency += 1;
                 	   break;
                 case 'N': this.anyNucleicAcidFrequency += 1;
                 	   break;
                 case 'U': this.uracilFrequency += 1;
                 	   break;
                 default: this.unknownFrequency += 1;
               }
             i++;
           }
         }
       else
         {
           alert("Error :: No DNA sequence present.");
         }
     }
     
     //private function to check for degeneracy and raise an alert
     this.checkDegeneracy = function()
       {
         var isDegenerate = false;
         for(i in this)
           {
             switch(i)
               {
                 case 'purineFrequency':         if(this.purineFrequency > 0)
                                                   {
                                                     isDegenerate = true;
                                                   }
                                                 break;
                 case 'pyrimidineFrequency':     if(this.pyrimidineFrequency > 0)
                                                   {
                                                     isDegenerate = true;
                                                   }
                                                 break;
                 case 'ketoFrequency':           if(this.ketoFrequency > 0)
                                                   {
                                                     isDegenerate = true;
                                                   }
                                                 break;
                 case 'aminoFrequency':          if(this.aminoFrequency > 0)
                                                   {
                                                     isDegenerate = true;
                                                   }
                                                 break;
                 case 'strongBondsFrequency':    if(this.strongBondsFrequency > 0)
                                                   {
                                                     isDegenerate = true;
                                                   }
                                                 break;
                 case 'weakBondsFrequency':      if(this.weakBondsFrequency > 0)
                                                   {
                                                     isDegenerate = true;
                                                   }
                                                 break;
                 case 'anyButAdenineFrequency':  if(this.anyButAdenineFrequency > 0)
                                                   {
                                                     isDegenerate = true;
                                                   }
                                                 break;
                 case 'anyButCytosineFrequency': if(this.anyButCytosineFrequency > 0)
                                                   {
                                                     isDegenerate = true;
                                                   }
                                                 break; 
                 case 'anyButGuanineFrequency':  if(this.anyButGuanineFrequency > 0)
                                                   {
                                                     isDegenerate = true;
                                                   }
                                                 break;
                 case 'anyButThymineFrequency':  if(this.anyButThymineFrequency > 0)
                                                   {
                                                     isDegenerate = true;
                                                   }
                                                 break;
                 case 'anyNucleicAcidFrequency': if(this.anyNucleicAcidFrequency > 0)
                                                   {
                                                     isDegenerate = true;
                                                   }
                                                 break;
             }
           }
         return isDegenerate;
       }
     
     //private render function to colour cells of DNAsequence
     this.sequenceToColour = function()
       {
       	 var html = '';
       	 var i = 0;
         while(this.DNASequence[i])
           {
             switch(this.DNASequence[i])
               {
                 case 'A': html += "<span class='a'>" + this.DNASequence[i] + "</span>";
                           break;
                 case 'T': html += "<span class='t'>" + this.DNASequence[i] + "</span>";
                           break;
                 case 'G': html += "<span class='g'>" + this.DNASequence[i] + "</span>";
                           break;
                 case 'C': html += "<span class='c'>" + this.DNASequence[i] + "</span>";
                           break;
                           default:  html += "<span class='u'>" + this.DNASequence[i] + "</span>";
               }
             i++;
           }
           return html;
       }
     
     //private render function to generate a table 
     this.sequenceToTable = function()
       {
     	var html = '<table>';
     	var i = 0;
     	var j = 1;
     	while(this.DNASequence[i])
           {
             if((j%60 == 1))
               {
                 html += "<tr>";
               }

             switch(this.DNASequence[i])
               {
                 case 'A': html += "<td class='a'>" + this.DNASequence[i] + "</td>";
                           break;
                 case 'T': html += "<td class='t'>" + this.DNASequence[i] + "</td>";
                           break;
                 case 'G': html += "<td class='g'>" + this.DNASequence[i] + "</td>";
                           break;
                 case 'C': html += "<td class='c'>" + this.DNASequence[i] + "</td>";
                           break;
                 default:  html += "<td class='u'>" + this.DNASequence[i] + "</td>";
               }

             if(j%60 == 0)
               {
                 html += "</tr>";
               }
             else if(i == this.DNASequence.length)
               {
               	 html += "</tr>";     
               }
             i++;
             j++;
           }
     	
     	html += '</table>';
     	return html;
       }
      
     //private render function to generate summary 
     this.summary = function()
       {
         var html = "<ul><li> Adenine frequency : " + this.adenineFrequency + "</li>";
	 html += "<li> Thymine frequency : " + this.thymineFrequency + "</li>";
	 html += "<li> Guanine frequency : " + this.guanineFrequency + "</li>";
	 html += "<li> Cytosine frequency : " + this.cytosineFrequency + "</li>";
	 html += "<li> Unknown residue frequency : " + this.unknownFrequency + "</li></ul>";
	 return html;
       }
      
     //private render function to generate summary table 
     this.summaryTable = function()
       {
         var html = "<table class='summary-table'><tr><th colspan='2'>Nucleic acid</th><th>Frequency</th></tr>";
         html += "<tr><td class='a'>A</td><td>denine</td><td>" + this.adenineFrequency + "</td></tr>";
         html += "<tr><td class='t'>T</td><td>hymine</td><td>" + this.thymineFrequency + "</td></tr>";
         html += "<tr><td class='g'>G</td><td>uanine</td><td>" + this.guanineFrequency + "</td></tr>";
         html += "<tr><td class='c'>C</td><td>ytosine</td><td>" + this.cytosineFrequency + "</td></tr>";
         html += "<tr><td> </td><td></td></tr>";
         html += "<tr><td class='u'>U</td><td>nknown</td><td>" + this.unknownFrequency + "</td></tr>";
         html += "</table>";
         html += "<hr></hr>";
         return html;
       }

     //private render function to generate summary degenerate table
     this.summaryDegenerateTable = function()
       {
         var html = '';
         if(this.checkDegeneracy() == true)
           {
             html += "<table class='summary-table' title='Degenerate sequences'>";
             html += "<tr><th colspan='2'>Ambiguous nucleic acids</th><th>Frequency</th></tr>";
             if(this.purineFrequency > 0)
               {
                 html += "<tr><td class='u'> R </td><td>Purine</td><td>" + this.purineFrequency + "</td></tr>";
               }
             if(this.pyrimidineFrequency > 0)
               {
                 html += "<tr><td class='u'> Y </td><td>Pyrimidine</td><td>" + this.pyrimidineFrequency + "</td></tr>";
               }
             if(this.ketoFrequency > 0)
               {
                 html += "<tr><td class='u'> K </td><td>Keto</td><td>" + this.ketoFrequency + "</td></tr>";
               }
             if(this.aminoFrequency > 0)
               {
                 html += "<tr><td class='u'> M </td><td>Amino</td><td>" + this.aminoFrequency + "</td></tr>";
               }
             if(this.strongBondsFrequency > 0)
               {
                 html += "<tr><td class='u'> S </td><td>Strong Bonds</td><td>" + this.strongBondsFrequency + "</td></tr>";
               }
             if(this.weakBondsFrequency > 0)
               {
                 html += "<tr><td class='u'> W </td><td>Weak Bonds</td><td>" + this.weakBondsFrequency + "</td></tr>";
               }
             if(this.anyButAdenineFrequency > 0)
               {
                 html += "<tr><td class='u'> B </td><td>Any but Adenine</td><td>" + this.anyButAdenineFrequency + "</td></tr>";
               }
             if(this.anyButCytosineFrequency > 0)
               {
                 html += "<tr><td class='u'> D </td><td>Any but Cytosine</td><td>" + this.anyButCytosineFrequency + "</td></tr>";
               }
             if(this.anyButGuanineFrequency > 0)
               {
                 html += "<tr><td class='u'> H </td><td>Any but Guanine</td><td>" + this.anyButGuanineFrequency + "</td></tr>";
               }
             if(this.anyButThymineFrequency > 0)
               {
                 html += "<tr><td class='u'> V </td><td>Any but Thymine</td><td>" + this.anyButThymineFrequency + "</td></tr>";
               }
             if(this.anyNucleicAcidFrequency > 0)
               {
                 html += "<tr><td class='u'> N </td><td>Any Nucleic Acid</td><td>" + this.anyNucleicAcidFrequency + "</td></tr>";
               }
             html += "</table>";
             html += "<hr></hr>";
           }
         return html;
       }

     //private function to generate JSON output
     this.toJSON = function()
       {
       	 //simple parsing method, can be replaced with more complex formatting
         return JSON.stringify(this);
       }
     
     //private function to generate HTML output  
     this.toHTML = function(ordinal)
       {
       	  html = "<link rel='stylesheet' type='text/css' href='main.css'></link>";
       	  html += "<div class='result'><h2>" + ordinal + " Sequence :: " + this.DNASequence.length + " nts</h2>";
       	  html += "<div class='sequence'>" + this.sequenceToTable() + "</div>";
       	  html += "<div class='summary'>" + this.summaryTable() + "</div>";
          html += "<div class='degeneracy-summary'>" + this.summaryDegenerateTable() + "</div>";
       	  html += "</div>";
       	  return html;
       }
  }

//parses fasta input text, returns an array of sequences 
function fastaReader(inputText)
  {
    var lineArray = inputText.split(/\r\n|\r|\n/);
    var sequence = '';
    var sequenceArray = new Array;
    for(var i=0; i<lineArray.length; i++)
      {

        if(lineArray[i].indexOf('>') == 0)
          {
            //skip the header and if sequence has content, push onto storage array
            if(sequence.length > 0)
              {
                sequenceArray.push(sequence);
                sequence = '';
              }
          }
        else if(lineArray[i].length > 0)
          {
            //concat the sequence until a new header reached
            sequence += lineArray[i].replace(/\s+/g, '');
          }

        //reached the last line push contents of sequence into storage
        if(i == lineArray.length-1)
          {
            sequenceArray.push(sequence);
          }
          
      }
    return sequenceArray;
  }
