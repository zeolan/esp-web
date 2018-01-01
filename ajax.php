<?php

	//read the mode and escape certain characters to avoid SQL injections
	$mode=escape($_GET["mode"]);

	//check if we have a valid mode
	if($mode=='range'||$mode=='single'||$mode=='init')
	{
		//establish database connection
		$con=new mysqli("gadget08.mysql.ukraine.com.ua","gadget08_sodb","5kjzzaea","gadget08_sodb");
		
		// Check if connection was established
		if (mysqli_connect_errno()) 
		  echo "Failed to connect to MySQL: " . mysqli_connect_error();	
		
		//query if we want to get a whole timerange
		if($mode=='range')
			//check if we have all parameters
			if($_GET["from"]&&$_GET["to"])
				$query = "SELECT DATETIME(Timestump) as output_datetime, SUM(`duration`) output_duration, AVG(outside_temp) output_temp FROM heating WHERE DATE(moment) BETWEEN '".escape($_GET["from"])."' AND '".escape($_GET["to"])."'  GROUP BY  DATE(moment)";
			else
			{
				echo "missing parameters for mode \"range\"";
				exit();
			}
		
		//query if we want to get a single day
		if($mode=='single')
			$query = "SELECT TimeStamp as output_datetime, Temperature as output_temp, Humidity as output_humid FROM place0";
		
		//query if we want to get a single day
		if($mode=='init')
			$query = "CREATE TABLE place0(TimeStamp DATETIME, Temperature FLOAT(3,1), Humidity FLOAT(3,0))";
		
		//uncomment for SQL debug
		//echo "SQL query was:<b> " . $query . "</b><br><br>";
		
		//get data from database
		$result = mysqli_query($con, $query);

		//close connection to database
		mysqli_close($con);
		
		//print "header"
		//echo "[";
		echo "[[\"output_datetime\", \"output_temp\",\"output_humid\"]";
		 
		//print data
		while ($row = mysqli_fetch_array($result))			
			echo ",[\"" . $row['output_datetime'] . "\", " . $row['output_temp'] . ", " . $row['output_humid'] . "]";
		
		//print end
		echo "]";
	}
	else
		echo "Unknown mode";
		
		
	
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
