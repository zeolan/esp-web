<?php

	//read the mode and escape certain characters to avoid SQL injections
	$place=escape($_POST["place"]);
	$date=escape($_POST["date"]);
	$temper=escape($_POST["temperature"]);
	$humid=escape($_POST["humidity"]);

	//check if we have a valid values
	if($place!='' && $date!='' && $temper!='' && $humid!='')
	{
		//establish database connection
		$con=new mysqli("gadget08.mysql.ukraine.com.ua","gadget08_sodb","5kjzzaea","gadget08_sodb");
		
		// Check if connection was established
		if (mysqli_connect_errno()) 
			echo "Failed to connect to MySQL: " . mysqli_connect_error();	
				
		//echo "[\"" . $place . "\", \"" . $date . "\", " . $temper . ", " . $humid . "]";
		
		//print end
		//echo "]\n";

		$query = "INSERT INTO $place VALUES(\"$date\",$temper,$humid)";
                echo $query;
		$result = mysqli_query($con, $query);

		//close connection to database
		mysqli_close($con);
	}
	
	// replace any non-ascii character with its hex code.
	//http://stackoverflow.com/questions/1162491/alternative-to-mysql-real-escape-string-without-connecting-to-db
	function escape($value) {
		$return = '';
		for($i = 0; $i < strlen($value); ++$i) {
			$char = $value[$i];
			$ord = ord($char);
			if($char !== "'" && $char !== "\"" && $char !== '\\' && $ord >= 32 && $ord <= 126)
				$return .= $char;
			else
				$return .= '\\x' . dechex($ord);
		}
		return $return;
	}	
?>
