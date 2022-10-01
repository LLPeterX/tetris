<?php
/* 
logger for tetris game.

в $_POST[] передаются данные:
game[]: закодированный в JSON массив game[20][10]
tick: # тика 
time: timestamp
text: описание действия

*/
$game = json_decode($_POST["game"]);
$tick = $_POST["tick"];
$time = $_POST["time"];
$text = $_POST["text"];
$tile = json_decode($_POST["tile"]); // текущая фигура

$handle = fopen("tetris.log","c");
fseek($handle,0,SEEK_END);
fprintf($handle, "# %03d %s %s\n", $tick, $time, $text);
// print game
 
for($i=0; $i<20; $i++) {
  $str="";
  for($j=0; $j<10; $j++) {
      $str .= strval($game[$i][$j]);
  }   
  $str .= "\n";
  fwrite($handle, $str);

}
// fwrite($handle, json_encode($_POST));
fwrite($handle,"\n-------------------------------\n");
fclose($handle);
echo "done";



?>
