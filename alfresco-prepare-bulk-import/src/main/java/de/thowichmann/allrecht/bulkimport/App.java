package de.thowichmann.allrecht.bulkimport;

import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;

/**
 * Hello world!
 *
 */
public class App 
{
	
	private static final String OPTION_INPUT_FILE = "i";
	
	private static final org.apache.logging.log4j.Logger logger = org.apache.logging.log4j.LogManager.getFormatterLogger();

    public static void main( String[] args )
    {
        
		CommandLineParser parser = new DefaultParser();
		try {
			
			CommandLine commandLine = parser.parse(createOptions(), args);
			
			String inputPath = commandLine.getOptionValue(OPTION_INPUT_FILE);
			logger.info("Read CSV input from %s", inputPath);
					
			
			Reader in = new FileReader(inputPath);
			Iterable<CSVRecord> records = CSVFormat.RFC4180.withFirstRecordAsHeader().parse(in);
			for (CSVRecord record : records) {

			}

			
		} catch (IOException e) {
			throw new RuntimeException(e);
		} catch (ParseException e) {
			throw new RuntimeException(e);
		}
		
    }
    

	private static Options createOptions() {

		Option optionSignal = Option.builder(OPTION_INPUT_FILE).hasArg().required().type(String.class)
				.desc("Path to the CSV import file.").build();

		return new Options().addOption(optionSignal);
	}

}
