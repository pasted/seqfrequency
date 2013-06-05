#!/usr/bin/perl -w
#file name: sequenceSummary.pl

#use Inline C;
use strict;
use CGI;
use CGI::Carp qw(warningsToBrowser fatalsToBrowser); 
use Switch;


#new CGI instance for processing HTTP requests and responses
my $connect = new CGI();

# scalar text_input accepts the string from the textarea in the form with name "sequence"
my $text_input = $connect->param("sequence");

#test variable for use of script in console
#my $text_input = "GCGCGTCAACT AATTAGCTTA  ggtgtgtgtg";

# array seq_array takes the returned values from function parse_sequences
# handles either Fasta or newline formats
my @seq_array = &parse_sequences($text_input);

# array errors_array takes the returned values from function check_errors
# checks for whether the text area was empty and the number of sequences submitted     
my @errors_array = &check_errors($text_input, \@seq_array);

# initialisation of scalar html, this will hold final HTML output
# although this will be returned to the browser as part of a JSON formatted HTTPrequest
my $html_output = '';

# initialisation of scalar i used as a counter for number of sequences
my $i = 0;

# initialisation of array storage, this will be a two dimensional array
my @storage = ();

# loop through each of the sequences returned by parse_sequences
foreach my $sequence (@seq_array)
  {
    
    # initialise array nc_counter to 4 elements, all zeros
    my @nc_counter = qw(0 0 0 0 0);
    # initialise scalars for the calculation results
    my $gc_content = 0;
    my $gc_deviation = 0;
    my $at_deviation = 0;

    # check the last index of the errors array if errors present skip
    if($#errors_array == -1)
      {
        # loop through the sequence
        for(my $i=0; $i<length($sequence); $i++)
        {
          # uppercase each character from the sequence as it is seen
	  my $this_nc = uc substr($sequence, $i, 1);
          # increase counter based on nucleotide found
	  switch($this_nc)
		{
	  case ("A") { $nc_counter[0]++; }
	  case ("C") { $nc_counter[1]++; }
	  case ("G") { $nc_counter[2]++; }
	  case ("T") { $nc_counter[3]++; }
          # any unrecognised characters assigned to an unknown counter
          else { $nc_counter[4]++; }
		}
         }

         # calculations
         $gc_content = calculate_gc_content(@nc_counter);
         $gc_deviation = calculate_gc_deviation(@nc_counter);
         $at_deviation = calculate_at_deviation(@nc_counter);

         # push results of calculations onto a 2d array, storage 
         push(@{ $storage[$i] }, $gc_content);
         push(@{ $storage[$i] }, $gc_deviation);
         push(@{ $storage[$i] }, $at_deviation);

       }
    
    # render results
    
    $html_output .= &render_results($html_output, \@nc_counter, \@storage, $i);
    
    $i++;
  }

# set scalar distance to zero
my $distance = 0;
# check if errors present
if($#errors_array < 0)
{
 # calculate distance
 $distance = &calculate_distance(\@storage);
 #$distance = distance(\@storage);
}

# prepare JSON output to AJAX
my $json_output = &to_json($html_output, \@errors_array, $distance);

# JSON CGI header
print $connect -> header(-type => "application/json", -charset => "utf-8");
# print JSON
print $json_output;

############################### Functions #############################################

# functions to check and parse the inputs
sub parse_sequences
  {

    my $text_input = shift;
    my @line_array = ();
    
    if(&check_format($text_input))
      {
        #fasta format
        @line_array = &parse_fasta(@line_array);
      }
    else
      {
        #default format
        @line_array = split(" ", $text_input);
      }

    return @line_array;
  }

sub check_format
  {
    my $input_str = shift;

    my $is_fasta = 0;
    # check for '>' in text
    if ($input_str =~ m/>/)
      {
        $is_fasta = 1;
      }
    return $is_fasta;
  }

sub parse_fasta
  {
    my @line_array = shift;
    my $sequence = '';
    my @sequence_array = ();

    for(my $i=0; $i<$#line_array; $i++)
      {

        if(index($line_array[$i],'>') == 0)
          {
            #skip the header and if sequence has content, push onto storage array
            if(length($sequence) > 0)
              {
                push(@sequence_array, $sequence);
                $sequence = '';
              }
          }
        elsif(length($line_array[$i]) > 0)
          {
            #concat the sequence until a new header reached
            $sequence += $line_array[$i] =~ s/\s+//g;
          }

        #reached the last line push contents of sequence into storage
        if($i == $#line_array-1)
          {
            push(@sequence_array, $sequence);
          }
          
      }
     return @sequence_array;
  }

sub check_errors
  {
    my @errors = ();
    my $text_input = shift;
    my $seq_array_ref = shift;
    
    my @seq_array = @{$seq_array_ref};
   
    if(!length($text_input))
	{
	  push(@errors, "ERROR :: No sequence data being posted from form.");
	}
    elsif($#seq_array != 1)
        {
          push(@errors, "ERROR :: Input requires exactly two sequences seperated by a new line, or in FASTA format.");
        }
  
    return @errors;
   }

# calculation functions
sub calculate_gc_content
  {
    my $nc_total = ($_[0] + $_[1] + $_[2] + $_[3]);
    my $gc_total = ($_[1] + $_[2]);
    my $gc_content = $gc_total / $nc_total;
    return $gc_content;
  }

sub calculate_gc_deviation
  {
    my $gc_deviation = 0;
    my $gc_total = ($_[1] + $_[2]);
    my $g_minus_c = ($_[1] - $_[2]);
    if($gc_total != 0)
      {
        $gc_deviation = $g_minus_c / $gc_total;
      } 
    return $gc_deviation;
  }

sub calculate_at_deviation
  {
    my $at_deviation = 0;
    my $a_minus_t = ($_[0] - $_[3]);
    my $at_total = ($_[0] + $_[3]);
    if($at_total != 0)
       {
         $at_deviation = $a_minus_t / $at_total;
       }
    return $at_deviation;
  }

sub calculate_distance 
  {
    #D=sqrt{(x1-y1)*(x1-y1)+(x2-y2)*(x2-y2)+(x3-y3)*(x3-y3)}
    my $storage_array_ref = shift;
    my @s = @{$storage_array_ref};
    my $distance = sqrt(  (($s[0][0] - $s[1][0]) * ($s[0][0] - $s[1][0])) 
			+ (($s[0][1] - $s[1][1]) * ($s[0][1] - $s[1][1])) 
			+ (($s[0][2] - $s[1][2]) * ($s[0][2] - $s[1][2]))  );
    return $distance;
  }

# rendering functions
sub to_json
  {
    
    my $html = shift;
    my $errors_array_ref = shift;
    my $distance = shift;

    my @errors = @{$errors_array_ref};
   
    my $errors_string = $errors[0];
    $html .= "<h2>Distance calculation between sequences</h2>";
    $html .= "<div id='distance'>Distance :: $distance</div>";
    my $json = ($#errors > -1) ? qq{{"error" : "$errors_string"}} : qq{{"success" : "$html"}} ;
    return $json;
  }


sub render_results 
  {
    my $html = shift;
    my $counter_array_ref = shift;
    my $storage_array_ref = shift;
    my $index = shift;
    my $display_index = $index + 1;

    my @counter_array = @{$counter_array_ref};
    my @storage_array = @{$storage_array_ref};

    my $gc_content = $storage_array[$index][0];
    my $gc_deviation = $storage_array[$index][1];
    my $at_deviation = $storage_array[$index][2]; 
   
    $html = "<h2>Sequence " . $display_index . " calculation results</h2>";
    $html .= "<table class='results-table'>";
    $html .= "<tr><th></th><th>Nucleic acid</th><th>Frequency</th></tr>";
    $html .= "<tr><td class='a'>A</td><td>denine</td><td>" . $counter_array[0] . "</td></tr>";
    $html .= "<tr><td class='c'>C</td><td>ytosine</td><td>" . $counter_array[1] . "</td></tr>";
    $html .= "<tr><td class='g'>G</td><td>uanine</td><td>" . $counter_array[2] . "</td></tr>";
    $html .= "<tr><td class='t'>T</td><td>hymine</td><td>" . $counter_array[3] . "</td></tr>";
    $html .= "<tr><td colspan='3'>GC Content is " . $gc_content . "</td></tr>";
    $html .= "<tr><td colspan='3'>GC deviation is " . $gc_deviation . "</td></tr>";
    $html .= "<tr><td colspan='3'>AT deviation is " . $at_deviation . "</td></tr>";
    $html .= "</table>";
    return $html;
  }

#__END__
#__C__


#float distance(AV * s) {
#    distance = sqrt(  (($s[0][0] - $s[1][0]) * ($s[0][0] - $s[1][0])) 
#			+ (($s[0][1] - $s[1][1]) * ($s[0][1] - $s[1][1])) 
#			+ (($s[0][2] - $s[1][2]) * ($s[0][2] - $s[1][2]))  );
#    return distance; 
#
#}
